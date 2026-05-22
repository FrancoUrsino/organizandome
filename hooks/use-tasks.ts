'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { getFirestoreDb, isFirebaseConfigured } from '@/lib/firebase'
import type { Task, TaskType, DashboardStats } from '@/types/task'

const STORAGE_KEY = 'bloom-tasks'

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// --- FUNCIONES AUXILIARES DE VALIDACIÓN TEMPORAL ---

const esHoy = (dateString?: string): boolean => {
  if (!dateString) return false
  const fecha = new Date(dateString)
  const hoy = new Date()
  return (
    fecha.getDate() === hoy.getDate() &&
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getFullYear() === hoy.getFullYear()
  )
}

const obtenerNumeroSemana = (d: Date): number => {
  const fecha = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const diaNum = fecha.getUTCDay() || 7
  fecha.setUTCDate(fecha.getUTCDate() + 4 - diaNum)
  const añoPrimero = new Date(Date.UTC(fecha.getUTCFullYear(), 0, 1))
  return Math.ceil((((fecha.getTime() - añoPrimero.getTime()) / 86400000) + 1) / 7)
}

const esSemanaActual = (dateString?: string): boolean => {
  if (!dateString) return false
  const fecha = new Date(dateString)
  const hoy = new Date()
  return (
    obtenerNumeroSemana(fecha) === obtenerNumeroSemana(hoy) &&
    fecha.getFullYear() === hoy.getFullYear()
  )
}

const esMesActual = (dateString?: string): boolean => {
  if (!dateString) return false
  const fecha = new Date(dateString)
  const hoy = new Date()
  return (
    fecha.getMonth() === hoy.getMonth() &&
    fecha.getFullYear() === hoy.getFullYear()
  )
}

// ----------------------------------------------------

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [useFirebase, setUseFirebase] = useState(false)

  // Initialize and load tasks
  useEffect(() => {
    const firebaseConfigured = isFirebaseConfigured()
    setUseFirebase(firebaseConfigured)

    if (firebaseConfigured) {
      const db = getFirestoreDb()
      if (db) {
        const tasksRef = collection(db, 'tasks')
        const q = query(tasksRef, orderBy('createdAt', 'desc'))

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const tasksData: Task[] = []
          snapshot.forEach((doc) => {
            const data = doc.data()
            tasksData.push({
              id: doc.id,
              title: data.title,
              description: data.description,
              priority: data.priority,
              type: data.type,
              completed: data.completed,
              createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
              dueDate: data.dueDate,
              dayOfWeek: data.dayOfWeek,
              monthDay: data.monthDay,
            })
          })
          setTasks(tasksData)
          setLoading(false)
        }, (error) => {
          console.error('[v0] Firebase error:', error)
          loadFromLocalStorage()
        })

        return () => unsubscribe()
      }
    }

    loadFromLocalStorage()
  }, [])

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setTasks(JSON.parse(stored))
      }
    } catch (error) {
      console.error('[v0] LocalStorage error:', error)
    }
    setLoading(false)
  }

  // Save to localStorage when tasks change (backup)
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    }
  }, [tasks, loading])

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      completed: false,
    }

    if (useFirebase) {
      const db = getFirestoreDb()
      if (db) {
        try {
          await addDoc(collection(db, 'tasks'), {
            ...taskData,
            createdAt: Timestamp.now(),
            completed: false,
          })
          return
        } catch (error) {
          console.error('[v0] Firebase add error:', error)
        }
      }
    }

    setTasks((prev) => [newTask, ...prev])
  }, [useFirebase])

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (useFirebase) {
      const db = getFirestoreDb()
      if (db) {
        try {
          await updateDoc(doc(db, 'tasks', id), updates)
          return
        } catch (error) {
          console.error('[v0] Firebase update error:', error)
        }
      }
    }

    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
    )
  }, [useFirebase])

  const deleteTask = useCallback(async (id: string) => {
    if (useFirebase) {
      const db = getFirestoreDb()
      if (db) {
        try {
          await deleteDoc(doc(db, 'tasks', id))
          return
        } catch (error) {
          console.error('[v0] Firebase delete error:', error)
        }
      }
    }

    setTasks((prev) => prev.filter((task) => task.id !== id))
  }, [useFirebase])

  const toggleComplete = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (task) {
      await updateTask(id, { completed: !task.completed })
    }
  }, [tasks, updateTask])

  // --- FILTRADO AUTOMÁTICO DE TAREAS ACTIVAS ---
  const getTasksByType = useCallback((type: TaskType) => {
    return tasks.filter((task) => {
      if (task.type !== type) return false
      if (!task.createdAt) return true // Por seguridad, si no tiene fecha la dejamos visible

      if (type === 'diaria') return esHoy(task.createdAt)
      if (type === 'semanal') return esSemanaActual(task.createdAt)
      if (type === 'mensual') return esMesActual(task.createdAt)

      return true
    })
  }, [tasks])

  // --- ESTADÍSTICAS DEL DASHBOARD SIN CONTAR LO VIEJO ---
  const getStats = useCallback((): DashboardStats => {
    const calculateStats = (type: TaskType) => {
      // Usamos el filtro de tiempo aquí también para que el dashboard no sume tareas viejas
      const typeTasks = tasks.filter((task) => {
        if (task.type !== type) return false
        if (!task.createdAt) return true
        if (type === 'diaria') return esHoy(task.createdAt)
        if (type === 'semanal') return esSemanaActual(task.createdAt)
        if (type === 'mensual') return esMesActual(task.createdAt)
        return true
      })

      return {
        total: typeTasks.length,
        completed: typeTasks.filter((t) => t.completed).length,
        pending: typeTasks.filter((t) => !t.completed).length,
      }
    }

    return {
      diarias: calculateStats('diaria'),
      semanales: calculateStats('semanal'),
      mensuales: calculateStats('mensual'),
    }
  }, [tasks])

  return {
    tasks,
    loading,
    useFirebase,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    getTasksByType,
    getStats,
  }
}