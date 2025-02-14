var main = new Vue({
    el: "#main", data: {
        loginshow: true,
        form: {
            username: '', password: '',
        },
        logining: false,
        resultshow: false,
        baseUrl: 'https://api.deye.com.cn/',
        activeDeviceListName: [''],
        deviceList: [],
        mqttInfo: {},
        token: '',
        clientId: '',

    }, methods: {
        async login() {
            try {
                const loginInfo = await superagent.post(`${this.baseUrl}v3/enduser/login/`)
                    // .set("User-Agent", "DeyeApp/2.2.9 (iPhone; iOS 15.4.1; Scale/2.00)")
                    .type("form")
                    .send({
                        "loginname": this.form.username,
                        "password": this.form.password,
                        "appid": "a774310e-a430-11e7-9d4c-00163e0c1b22",
                        "pushtype": "Ali",
                        "extend": "{\"cid\":\"111111122223333\",\"type\":\"1\"}"
                    })
                const loginInfoBody = loginInfo.body
                console.log(loginInfo);
                if (loginInfoBody.meta.code !== 0) {
                    this.$message.error("Login failed, " + JSON.stringify(loginInfoBody.meta.message))
                    this.logining = false
                    return
                } else {
                    this.token = loginInfoBody.data.token
                    this.clientId = loginInfoBody.data.clientid
                }

                const deviceListResult = await superagent.get(`${this.baseUrl}v3/enduser/deviceList/?app=new`)
                    // .set("User-Agent", "DeyeApp/2.2.9 (iPhone; iOS 15.4.1; Scale/2.00)")
                    .set("Authorization", `JWT ${this.token}`)

                const deviceListInfo = deviceListResult.body
                console.log(deviceListInfo);
                if (deviceListInfo.meta.code !== 0) {
                    this.$message.error("Get Device failed, " + JSON.stringify(deviceListInfo.meta.message))
                    this.logining = false
                    return
                } else {
                    this.deviceList = deviceListInfo.data
                }

                let mqttResult = await superagent.get(`${this.baseUrl}v3/enduser/mqttInfo/`)
                    // .set("User-Agent", "DeyeApp/2.2.9 (iPhone; iOS 15.4.1; Scale/2.00)")
                    .set("Authorization", `JWT ${this.token}`)

                let mqttInfo = mqttResult.body
                console.log(mqttInfo);

                if (mqttInfo.meta.code === 10002) {
                    mqttResult = await superagent.get(`${this.baseUrl}v3/enduser/fogmqttinfo/`)
                        // .set("User-Agent", "DeyeApp/2.2.9 (iPhone; iOS 15.4.1; Scale/2.00)")
                        .set("Authorization", `JWT ${this.token}`)
                    mqttInfo = mqttResult.body
                    console.log(mqttInfo);
                }

                if (mqttInfo.meta.code !== 0) {
                    this.$message.error("Get MQTT failed, " + JSON.stringify(mqttInfo.meta.message))
                    this.logining = false
                    return
                } else {
                    if (mqttInfo.data.mqtthost) {
                        this.mqttInfo = mqttInfo.data
                    } else {
                        this.mqttInfo = {
                            mqtthost: mqttInfo.data.mqtt_host,
                            mqttport: "WS port: " + mqttInfo.data.ws_port + " SSL port: " + mqttInfo.data.ssl_port,
                            loginname: mqttInfo.data.username,
                            password: mqttInfo.data.password,
                            clientid: mqttInfo.data.clientid,
                            endpoint: "FogCloud Topic: " + JSON.stringify(mqttInfo.data.topic),
                            isFog: true
                        }
                    }
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