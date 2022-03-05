var main = new Vue({
  el: "#main",
  data: {
    loginshow: true,
    form: {
      username: '',
      password: '',
    },
    logining: false,
    resultshow: false,
    baseUrl: 'https://api.deye.com.cn/',
    activeDeviceListName: [''],
    deviceList: [],
    mqttInfo: {},
    token: '',
    clientId: '',

  },
  methods: {
    async login() {
      try {
        const loginInfo = await axios.post(`${this.baseUrl}v3/enduser/login/`,
          {
            "loginname": this.form.username,
            "password": this.form.password,
            "appid": "v2.16",
            "pushtype": "Ali",
            "extend": "{\"cid\":\"111111122223333\",\"type\":\"0\"}"
          })
        if (loginInfo.data.meta.code !== 0) {
          console.log(loginInfo);
          this.$message.error("Login failed, " + JSON.stringify(loginInfo.data.meta.message))
          this.logining = false
          return
        } else {
          this.token = loginInfo.data.data.token
          this.clientId = loginInfo.data.data.clientid
        }

        const devicListResult = await axios.get(`${this.baseUrl}v3/enduser/deviceList`, {
          headers: {
            'Authorization': `JWT ${this.token}`,
          }
        })
        const deviceListInfo = devicListResult.data
        if (deviceListInfo.meta.code !== 0) {
          console.log(loginInfo);
          this.$message.error("Get Device failed, " + JSON.stringify(loginInfo.data.meta.message))
          this.logining = false
          return
        } else {
          this.deviceList = deviceListInfo.data
        }
        const mqttResult = await axios.get(`${this.baseUrl}v3/enduser/mqttInfo`, {
          headers: {
            'Authorization': `JWT ${this.token}`,
          }
        })
        const mqttInfo = mqttResult.data
        if (mqttInfo.meta.code !== 0) {
          console.log(loginInfo);
          this.$message.error("Get MQTT failed, " + JSON.stringify(loginInfo.data.meta.message))
          this.logining = false
          return
        } else {
          this.mqttInfo = mqttInfo.data
        }
        this.$message.success("Login Success")
        this.loginshow = false
        this.resultshow = true
      } catch (error) {
        console.error(error)
        this.$message.error("Failed, " + error.message)
      }
    }
  }
})