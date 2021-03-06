import {BlockType} from './BlockType'
import {v4 as uuid} from 'uuid'
import {BlockProperties} from './BlockProperties'
import {Block} from './Block'

export const createBlock = <T extends Block>(blockType: BlockType): T => {
  return {
    id: uuid(),
    type: blockType,
    properties: createDefaultProperties(blockType),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any
}

const createDefaultProperties = (blockType: BlockType): BlockProperties => {
  switch (blockType) {
    case BlockType.Page:
      return {title: ''}
    case BlockType.Text:
      return {text: ''}
  }

  throw new Error(`Unknown blockType: ${blockType}`)
}
