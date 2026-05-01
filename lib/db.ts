import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { PictureBook } from '@/types';

const DB_NAME = 'StoryBookDB';
const DB_VERSION = 2;
const STORE_NAME = 'pictureBooks';

interface StoredPage {
  pageNumber: number;
  storyText: string;
  imageData: ArrayBuffer;
  imageType: string;
  prompt: string;
}

interface StoredBook {
  id: string;
  title: string;
  characters: { name: string; appearance: string }[];
  pages: StoredPage[];
  coverImageData: ArrayBuffer;
  coverImageType: string;
  createdAt: string;
}

interface StoryBookDB extends DBSchema {
  pictureBooks: {
    key: string;
    value: StoredBook;
  };
}

let dbPromise: Promise<IDBPDatabase<StoryBookDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<StoryBookDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      },
    }).catch((err) => {
      // 失败时重置 dbPromise，允许下次重试
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
}

function arrayBufferToBlob(buffer: ArrayBuffer, type: string): Blob {
  return new Blob([buffer], { type });
}

function mapToStored(book: PictureBook): Promise<StoredBook> {
  return Promise.all(
    book.pages.map(async (p) => ({
      pageNumber: p.pageNumber,
      storyText: p.storyText,
      imageData: await blobToArrayBuffer(p.imageBlob),
      imageType: p.imageBlob.type || 'image/jpeg',
      prompt: p.prompt,
    }))
  ).then(async (pages) => ({
    id: book.id,
    title: book.title,
    characters: book.characters,
    pages,
    coverImageData: await blobToArrayBuffer(book.coverImageBlob),
    coverImageType: book.coverImageBlob.type || 'image/jpeg',
    createdAt: book.createdAt.toISOString(),
  }));
}

function mapFromStored(raw: StoredBook): PictureBook {
  return {
    id: raw.id,
    title: raw.title,
    characters: raw.characters,
    pages: raw.pages.map((p) => ({
      pageNumber: p.pageNumber,
      storyText: p.storyText,
      imageBlob: arrayBufferToBlob(p.imageData, p.imageType || 'image/jpeg'),
      prompt: p.prompt,
    })),
    coverImageBlob: arrayBufferToBlob(raw.coverImageData, raw.coverImageType || 'image/jpeg'),
    createdAt: new Date(raw.createdAt),
  };
}

export async function savePictureBook(book: PictureBook): Promise<void> {
  const db = await getDB();
  const stored = await mapToStored(book);
  await db.put(STORE_NAME, stored);
}

export async function getPictureBook(id: string): Promise<PictureBook | null> {
  const db = await getDB();
  const raw = await db.get(STORE_NAME, id);
  if (!raw) return null;
  return mapFromStored(raw);
}

export async function getAllPictureBooks(): Promise<PictureBook[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_NAME);
  return all.map(mapFromStored);
}

export async function deletePictureBook(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
