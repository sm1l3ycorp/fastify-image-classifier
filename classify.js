const tfnode = require('@tensorflow/tfjs-node-gpu')
const mobilenet = require('@tensorflow-models/mobilenet')
const cocoSsd = require('@tensorflow-models/coco-ssd')

const classify = async (image) => {
  const decodedImage = tfnode.node.decodeImage(image.buffer, 3)

  const mobilenetModel = await mobilenet.load()
  const mobilenetPredictions = await mobilenetModel.classify(decodedImage)

  const cocoSsdModel = await cocoSsd.load()
  const cocoSsdPredications = await cocoSsdModel.detect(decodedImage)
  cocoSsdModel.dispose()

  const allPredications = []

  if (mobilenetPredictions) {
    mobilenetPredictions.forEach((element) => {
      element.probability = `${parseFloat(element.probability * 100).toFixed(2)}`
      if (element.probability >= 80) {
        element.score = element.probability
        delete element.probability
        element.class = element.className
        delete element.className
        allPredications.push(element)
      }
    })
  }

  if (cocoSsdPredications) {
    cocoSsdPredications.forEach((element) => {
      if (element.bbox) {
        delete element.bbox
      }
      element.score = `${parseFloat(element.score * 100).toFixed(2)}`
      if (element.score >= 80) {
        allPredications.push(element)
      }
    })
  }

  return allPredications
}

module.exports = { classify }
