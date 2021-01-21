const si = require('../../')
const test = require('tape')

const sandbox = 'test/sandbox/'
const testIndex = sandbox + 'stopword-test'

const data = [
  'this is a giant banana',
  'this is a giant pineapple',
  'this is a small pineapple'
]

const autoGeneratedIds = []

test('create a case sensitive search index', t => {
  t.plan(1)
  si({
    name: testIndex,
    stopwords: ['this', 'is', 'a', 'small']
  }).then(db => {
    global[testIndex] = db
    t.pass('ok')
  })
})

test('can add data to case sensitive index', t => {
  t.plan(9)
  global[testIndex].PUT(data).then(response => response.forEach(item => {
    t.equals(item.operation, 'PUT')
    t.equals(item.status, 'CREATED')
    t.match(item._id, /\d{13}-\d/gm, 'id has correct format')
    autoGeneratedIds.push(item._id)
  }))
})

test('verify index structure', t => {
  const expectedIndexStructure = [
    { key: 'body:banana#1.00', value: [autoGeneratedIds[0]] },
    {
      key: 'body:giant#1.00',
      value: [autoGeneratedIds[0], autoGeneratedIds[1]]
    },
    {
      key: 'body:pineapple#1.00',
      value: [autoGeneratedIds[1], autoGeneratedIds[2]]
    },
    { key: '￮DOCUMENT_COUNT￮', value: 3 },
    {
      key: '￮DOC_RAW￮' + autoGeneratedIds[0] + '￮',
      value: { body: 'this is a giant banana', _id: autoGeneratedIds[0] }
    },
    {
      key: '￮DOC_RAW￮' + autoGeneratedIds[1] + '￮',
      value: { body: 'this is a giant pineapple', _id: autoGeneratedIds[1] }
    },
    {
      key: '￮DOC_RAW￮' + autoGeneratedIds[2] + '￮',
      value: { body: 'this is a small pineapple', _id: autoGeneratedIds[2] }
    },
    { key: '￮FIELD￮body￮', value: 'body' }
  ]
  t.plan(expectedIndexStructure.length)
  global[testIndex].INDEX.STORE.createReadStream({ lt: '￮￮' })
    .on('data', d => t.deepEquals(d, expectedIndexStructure.shift()))
})

test('search with stopwords', t => {
  t.plan(1)
  global[testIndex].QUERY({
    AND: 'this is a small banana'.split(' ')
  }).then(res => {
    t.deepEqual(res, {
      RESULT: [
        {
          _id: autoGeneratedIds[0],
          _match: ['body:banana#1.00']
        }
      ],
      RESULT_LENGTH: 1
    })
  })
})
