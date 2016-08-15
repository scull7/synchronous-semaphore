
const { randomBytes } = require('crypto');

const RANDOM_BYTE_COUNT = 32; // 256-bits
const DEFAULT_TTL = 30000; // 30 seconds

/**
 * type alias Station = Dictionary Signal String
 */


// Now :: Timestamp
const Now       = () => new Date().getTime();


// Signal :: Int -> String -> Signal
const Signal    = (ttl, key) => ({ ttl: ttl, key: key, timestamp: Now() });


// TimeLived :: Timestamp -> Int
const TimeLived = (birth_date) => Now() - birth_date;


// isAlive :: Signal -> Bool
const isAlive = (signal) => TimeLived(signal.timestamp) < signal.ttl;


// isCorrectKey :: Station -> String -> String -> Bool
const isCorrectKey = (station, id, key) => station[id].key === key;


// hasId :: Station -> String -> Bool
const hasId = (station, id) => station.hasOwnProperty(id);


// canLock :: String -> Bool
const canLock = (station, id) => !hasId(station, id) || !isAlive(station[id])


// canUnlock :: String -> String -> Bool
const canUnlock = (station, id, key) =>
  canLock(station, id) || isCorrectKey(station, id, key);


const generateKey = (id) => new Promise((resolve, reject) =>
  randomBytes(RANDOM_BYTE_COUNT, (err, buf) =>
    err ? reject(err) : resolve( id + buf.toString('hex') )
  )
);


// lock :: Station -> String -> Int -> Promise Maybe String
const lock = (station, id, ttl = DEFAULT_TTL) => {

  if (!canLock(station, id)) return Promise.resolve(null);

  // lock with an unlockable key so we create our semaphore synchronously
  station[id] = Signal(ttl, Math.random());

  return generateKey(id).then((key) => {

    station[id] = Signal(ttl, key);

    return key;

  });

};


// release :: Station -> String -> String -> Bool
const release = (station, id, key) => {
  
  if (!canUnlock(station, id, key)) return Promise.resolve(false);

  delete station[id];

  return Promise.resolve(true);

};


module.exports = () => {
  const station = {};

  return {
    lock: lock.bind(null, station)
  , release: release.bind(null, station)
  }
};
