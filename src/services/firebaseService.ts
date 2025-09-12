import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Task } from '../types/Task';

export class FirebaseService {
  private collectionName = 'tasks';

  // Convert Firestore timestamp to ISO string
  private convertFirestoreTask(doc: any): Task {
    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      dueDate: data.dueDate?.toDate?.()?.toISOString() || data.dueDate,
    } as Task;
  }

  // Convert Task to Firestore format
  private convertToFirestoreTask(task: Partial<Task>) {
    const firestoreTask: any = { ...task };
    
    if (task.createdAt) {
      firestoreTask.createdAt = Timestamp.fromDate(new Date(task.createdAt));
    }
    if (task.updatedAt) {
      firestoreTask.updatedAt = Timestamp.fromDate(new Date(task.updatedAt));
    }
    if (task.dueDate) {
      firestoreTask.dueDate = Timestamp.fromDate(new Date(task.dueDate));
    }
    
    // Remove id from the data to be stored
    delete firestoreTask.id;
    
    return firestoreTask;
  }

  // Get all tasks for a user
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => this.convertFirestoreTask(doc));
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  subscribeToTasks(userId: string, callback: (tasks: Task[]) => void): () => void {
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const tasks = querySnapshot.docs.map(doc => this.convertFirestoreTask(doc));
      callback(tasks);
    });
  }

  // Add a new task
  async addTask(task: Omit<Task, 'id'>, userId: string): Promise<string> {
    try {
      const taskWithUser = {
        ...task,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(
        collection(db, this.collectionName),
        this.convertToFirestoreTask(taskWithUser)
      );
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  }

  // Update a task
  async updateTask(taskId: string, updates: Partial<Task>, userId: string): Promise<void> {
    try {
      const taskRef = doc(db, this.collectionName, taskId);
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: new Date().toISOString(),
        userId // Ensure user ownership
      };
      
      await updateDoc(taskRef, this.convertToFirestoreTask(updatesWithTimestamp));
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.collectionName, taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  // Bulk operations for migration
  async migrateLocalTasks(tasks: Task[], userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);
      
      tasks.forEach(task => {
        const taskWithUser = {
          ...task,
          userId,
          updatedAt: new Date().toISOString()
        };
        
        const docRef = doc(collection(db, this.collectionName));
        batch.set(docRef, this.convertToFirestoreTask(taskWithUser));
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Error migrating tasks:', error);
      throw error;
    }
  }
}

export const firebaseService = new FirebaseService();
