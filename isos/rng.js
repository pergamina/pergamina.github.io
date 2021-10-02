
function RandomNumberGenerator() {
    var m_w = 0xdeadbeef;
    var m_z = 0x12345678;
     
    var that = this;

    that.randomize = function (seed) {
      seed = Math.floor(seed * 123456789123456789);
      m_w = (seed % 0xffffffff) & 0xffffffff;
      while (m_w == 0 || m_w == 0x464fffff) {
        m_w += 1;
      }
      m_z = (seed / 0xffffffff) & 0xffffffff;
      while (m_z == 0 || m_z == 0x9068ffff) {
        m_z += 1;
      }
    };

    /* 32-bit result */
    that.random_number = function () {
      m_z = 36969 * (m_z & 65535) + (m_z >> 16);
      m_w = 18000 * (m_w & 65535) + (m_w >> 16);
      return (m_z << 16) + m_w;
    };

    that.rnd = function () {
      return ((0x7fffffff + that.random_number()) % 0xffffffff) / 0xffffffff;
    };

    that.choice = function (lst) {
      return lst[Math.floor(that.rnd() * lst.length)];
    };
}

