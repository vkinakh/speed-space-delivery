module.exports = function(next) {
  const geo = "123" + this.req.ip;
  next(null, {
    geoip: {
      country: geo ? geo.country : null
    }
  })
}