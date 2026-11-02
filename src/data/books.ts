import type { ImageMetadata } from 'astro'
import flow from '../assets/books/flow.jpg'
import alchemist from '../assets/books/the-alchemist.jpg'
import habits from '../assets/books/atomic-habits.jpg'
import thinking from '../assets/books/the-art-of-thinking-clearly.jpg'
import fahrenheit from '../assets/books/fahrenheit-451.jpg'
import odyssey from '../assets/books/the-odyssey.jpg'
import oedipus from '../assets/books/oedipus-the-king.jpg'
import gatsby from '../assets/books/the-great-gatsby.jpg'
import truth from '../assets/books/the-honest-truth.jpg'
import war from '../assets/books/the-art-of-war.jpg'
import flies from '../assets/books/lord-of-the-flies.jpg'
import kite from '../assets/books/the-kite-runner.jpg'
import quiet from '../assets/books/all-quiet-on-the-western-front.jpg'
import economics from '../assets/books/naked-economics.jpg'

export interface Book {
  title: string
  subtitle?: string
  author: string
  cover: ImageMetadata
  favorite?: boolean
}

export const currentlyReading: Book[] = [
  { title: 'Flow', subtitle: 'The Psychology of Optimal Experience', author: 'Mihaly Csikszentmihalyi', cover: flow },
]

export const completedBooks: Book[] = [
  { title: 'The Alchemist', author: 'Paulo Coelho', cover: alchemist, favorite: true },
  { title: 'Atomic Habits', author: 'James Clear', cover: habits },
  { title: 'The Art of Thinking Clearly', author: 'Rolf Dobelli', cover: thinking },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', cover: fahrenheit, favorite: true },
  { title: 'The Odyssey', author: 'Homer', cover: odyssey },
  { title: 'Oedipus the King', author: 'Sophocles', cover: oedipus },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover: gatsby },
  { title: 'The Honest Truth', author: 'Dan Gemeinhart', cover: truth, favorite: true },
  { title: 'The Art of War', author: 'Sun Tzu', cover: war },
  { title: 'Lord of the Flies', author: 'William Golding', cover: flies },
  { title: 'The Kite Runner', author: 'Khaled Hosseini', cover: kite },
  { title: 'All Quiet on the Western Front', author: 'Erich Maria Remarque', cover: quiet },
  { title: 'Naked Economics', author: 'Charles Wheelan', cover: economics },
]
