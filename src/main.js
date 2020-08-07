import fii from 'fergies-inverted-index'
import writer from './write.js'
import reader from './read.js'

const makeASearchIndex = (idx, ops) => {
  const w = writer(idx, ops)
  const r = reader(idx)
  return {
    // inherited from fergies-inverted-index
    _AND: idx.AND,
    _BUCKET: idx.BUCKET,
    _BUCKETFILTER: idx.BUCKETFILTER,
    _FIELDS: idx.FIELDS,
    _GET: idx.GET,
    _MAX: idx.MAX,
    _MIN: idx.MIN,
    _NOT: idx.SET_SUBTRACTION,
    _OR: idx.OR,

    // search-index read
    _DICTIONARY: r.DICTIONARY,
    _DISTINCT: r.DISTINCT,
    _DOCUMENTS: r.DOCUMENTS,
    _DOCUMENT_COUNT: r.DOCUMENT_COUNT,
    _PAGE: r.PAGE,
    _SCORE: r.SCORE,
    _SEARCH: r.SEARCH,
    _SORT: r.SORT,

    // search-index write
    _DELETE: w.DELETE,

    // public API
    INDEX: idx,
    PUT: w.PUT,
    GET: r.QUERY,
    UPDATE: w.UPDATE

  }
}

export default function (ops) {
  return new Promise((resolve, reject) => {
    ops = Object.assign({
      tokenAppend: '#',
      caseSensitive: false
    }, ops || {})
    // if a fergies-inverted-index is passed as an option
    if (ops.fii) return resolve(makeASearchIndex(ops.fii, ops))
    // else make a new fergies-inverted-index
    fii(ops, (err, idx) => {
      if (err) return reject(err)
      resolve(makeASearchIndex(idx, ops))
    })
  })
}
