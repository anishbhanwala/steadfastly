import {TableName} from '../types/TablesName'
import {PageDataStore} from './PageDataStore'

export class Db {
  private db?: IDBDatabase

  isConnected(): boolean {
    return !!this.db
  }

  instance(): IDBDatabase {
    if (!this.db) throw new Error('Database not yet initialized')
    return this.db!
  }

  private getObjectStore(
    storeName: TableName,
    mode: IDBTransactionMode,
  ): IDBObjectStore {
    const tx = this.instance().transaction(storeName, mode)
    return tx.objectStore(storeName)
  }

  connect(databaseName: string, databaseVersion: number): Promise<void> {
    const request = indexedDB.open(databaseName, databaseVersion)
    return new Promise<void>((resolve, reject) => {
      request.onerror = (event: any): void => {
        console.log(event)
        reject(event?.target?.errorCode)
      }
      request.onsuccess = (): void => {
        this.db = request.result
        this.db.onclose = (): void => console.log('database closed')
        resolve()
      }

      request.onupgradeneeded = (event): void => {
        this.db = request.result
        this.db.onclose = (): void => console.log('database closed')
        /*  We need to wait for pageDataStore to complete. See below link 
          https://stackoverflow.com/questions/33709976/uncaught-invalidstateerror-failed-to-execute-transaction-on-idbdatabase-a 
        */
        PageDataStore.create(this)

        const tx = request.transaction!

        tx.oncomplete = function (): void {
          // Now store is available to be populated
          resolve()
        }
      }
    })
  }

  insert<T>(tableName: TableName, obj: T): Promise<void> {
    const store = this.getObjectStore(tableName, 'readwrite')
    return new Promise<void>((resolve, reject) => {
      let req = store.add(obj)
      req.onsuccess = function (): void {
        resolve()
      }
      req.onerror = function (): void {
        console.error('error', req.error)
        reject(req.error)
      }
    })
  }

  getById<T>(tableName: string, id: string): Promise<T | undefined> {
    const transaction = this.instance().transaction(tableName)
    const objectStore = transaction.objectStore(tableName)
    return new Promise<T>((resolve, reject) => {
      const request = objectStore.get(id)
      request.onerror = function (): void {
        reject(request.error)
      }
      request.onsuccess = function (): void {
        resolve(request.result)
      }
    })
  }

  deleteDatabase(databaseName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve()
        return
      }

      this.instance().close()
      const deleteRequest = indexedDB.deleteDatabase(databaseName)

      deleteRequest.onerror = function (): void {
        console.log(deleteRequest.error)
        reject(deleteRequest.error)
      }

      deleteRequest.onsuccess = function (): void {
        resolve()
      }
    })
  }
}
