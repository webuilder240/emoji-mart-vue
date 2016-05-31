var fs = require('fs')
var emojiData = require('emoji-data')
var inflection = require('inflection')
var mkdirp = require('mkdirp')

var categories = ['People', 'Nature', 'Foods', 'Activity', 'Places', 'Objects', 'Symbols', 'Flags', 'Skins']
var data = { categories: [], emojis: {} }
var categoriesIndex = {}

categories.forEach((category, i) => {
  data.categories[i] = { name: category, emojis: [] }
  categoriesIndex[category] = i
})

emojiData.sort((a, b) => {
  var aTest = a.sort_order || a.short_name
  var bTest = b.sort_order || b.short_name

  return aTest - bTest
})

emojiData.forEach((datum) => {
  var category = datum.category,
      shortName = datum.short_name,
      categoryIndex

  if (!category) {
    if (/^skin/.test(shortName)) category = 'Skins'
    if (/^flag/.test(shortName)) category = 'Flags'
    if (/^(left_speech_bubble|keycap_star|eject)$/.test(shortName)) category = 'Symbols'
  }

  if (!category) {
    throw new Error('“' + datum.short_name + '” doesn’t have a category')
  }

  datum.name || (datum.name = datum.short_name.replace(/\-/g, ' '))
  datum.name = inflection.titleize(datum.name || '')

  if (!datum.name) {
    throw new Error('“' + datum.short_name + '” doesn’t have a name')
  }

  categoryIndex = categoriesIndex[category]
  data.categories[categoryIndex].emojis.push(datum.short_name)
  data.emojis[datum.short_name] = datum
})

mkdirp('data', (err) => {
  if (err) throw err

  fs.writeFile('data/index.js', `export default ${JSON.stringify(data)}`, (err) => {
    if (err) throw err
  })
})
