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
import mars from '../assets/books/life-on-mars.jpg'
import finisher from '../assets/books/the-finisher.jpg'
import wonder from '../assets/books/wonder.jpg'
import hatchet from '../assets/books/hatchet.jpg'
import romeo from '../assets/books/romeo-and-juliet.jpg'
import creativeAct from '../assets/books/the-creative-act.jpg'

export interface Book {
  title: string
  subtitle?: string
  author: string
  cover: ImageMetadata
  favorite?: boolean
}

export interface BookSeries extends Book {
  volumes: { title: string; cover: ImageMetadata }[]
}

const seriesCovers = import.meta.glob<ImageMetadata>('../assets/books/series/*.jpg', {
  eager: true,
  import: 'default',
})

function makeSeries(title: string, author: string, prefix: string, titles: string[], favorite = false): BookSeries {
  const volumes = titles.map((name, index) => {
    const path = `../assets/books/series/${prefix}-${index + 1}.jpg`
    const cover = seriesCovers[path]
    if (!cover) throw new Error(`Missing series cover: ${path}`)
    return { title: name, cover }
  })
  return { title, author, cover: volumes[0]!.cover, volumes, favorite }
}

export const completedSeries: BookSeries[] = [
  makeSeries('Harry Potter', 'J. K. Rowling', 'hp', [
    'Harry Potter and the Sorcerer’s Stone',
    'Harry Potter and the Chamber of Secrets',
    'Harry Potter and the Prisoner of Azkaban',
    'Harry Potter and the Goblet of Fire',
    'Harry Potter and the Order of the Phoenix',
    'Harry Potter and the Half-Blood Prince',
    'Harry Potter and the Deathly Hallows',
  ], true),
  makeSeries('Percy Jackson and the Olympians', 'Rick Riordan', 'percy', [
    'The Lightning Thief',
    'The Sea of Monsters',
    'The Titan’s Curse',
    'The Battle of the Labyrinth',
    'The Last Olympian',
  ], true),
  makeSeries('The Heroes of Olympus', 'Rick Riordan', 'heroes', [
    'The Lost Hero',
    'The Son of Neptune',
    'The Mark of Athena',
    'The House of Hades',
    'The Blood of Olympus',
  ]),
  makeSeries('The Kane Chronicles', 'Rick Riordan', 'kane', [
    'The Red Pyramid',
    'The Throne of Fire',
    'The Serpent’s Shadow',
  ]),
  makeSeries('The Hunger Games', 'Suzanne Collins', 'hunger', [
    'The Hunger Games',
    'Catching Fire',
    'Mockingjay',
    'The Ballad of Songbirds and Snakes',
    'Sunrise on the Reaping',
  ]),
  makeSeries('The Maze Runner', 'James Dashner', 'maze', [
    'The Maze Runner',
    'The Scorch Trials',
    'The Death Cure',
  ]),
  makeSeries('The 39 Clues', 'Various authors', 'clues', [
    'The Maze of Bones',
    'One False Note',
    'The Sword Thief',
    'Beyond the Grave',
    'The Black Circle',
    'In Too Deep',
    'The Viper’s Nest',
    'The Emperor’s Code',
    'Storm Warning',
    'Into the Gauntlet',
  ]),
]

export const currentlyReading: Book[] = [
  { title: 'Flow', author: 'Mihaly Csikszentmihalyi', cover: flow },
]

export const completedBooks: Book[] = [
  { title: 'The Alchemist', author: 'Paulo Coelho', cover: alchemist, favorite: true },
  { title: 'Atomic Habits', author: 'James Clear', cover: habits },
  { title: 'The Art of Thinking Clearly', author: 'Rolf Dobelli', cover: thinking },
  { title: 'Naked Economics', author: 'Charles Wheelan', cover: economics },
  { title: 'The Creative Act', author: 'Rick Rubin', cover: creativeAct },
  { title: 'Fahrenheit 451', author: 'Ray Bradbury', cover: fahrenheit, favorite: true },
  { title: 'The Odyssey', author: 'Homer', cover: odyssey },
  { title: 'Oedipus the King', author: 'Sophocles', cover: oedipus },
  { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover: gatsby },
  { title: 'The Honest Truth', author: 'Dan Gemeinhart', cover: truth, favorite: true },
  { title: 'The Art of War', author: 'Sun Tzu', cover: war },
  { title: 'Lord of the Flies', author: 'William Golding', cover: flies },
  { title: 'The Kite Runner', author: 'Khaled Hosseini', cover: kite },
  { title: 'All Quiet on the Western Front', author: 'Erich Maria Remarque', cover: quiet },
  { title: 'Life on Mars', author: 'Jennifer Brown', cover: mars },
  { title: 'The Finisher', author: 'David Baldacci', cover: finisher },
  { title: 'Wonder', author: 'R. J. Palacio', cover: wonder },
  { title: 'Hatchet', author: 'Gary Paulsen', cover: hatchet, favorite: true },
  { title: 'Romeo and Juliet', author: 'William Shakespeare', cover: romeo },
]
