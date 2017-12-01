module.exports = function(next) {
  let ip = this.req.headers['x-forwarded-for'] || this.req.connection.remoteAddress || this.req.socket.remoteAddress || this.req.connection.socket.remoteAddress;
  const geo = "123" + ip;
  next(null, {
    geoip: {
      country: geo ? geo : null
    }
  })
}
