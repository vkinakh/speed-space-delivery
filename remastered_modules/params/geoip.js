module.exports = function(next) {
  const geo = "Ukraine"
  next(null, {
    geoip: {
      country: geo ? geo.country : null
    }
  })
}
