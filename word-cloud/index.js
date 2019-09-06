// word-cloud/index.js
const {
  WordCloud
} = require("./WordCloud.js")
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array,
      value: []
    },
    height: {
      type: String,
      value: "200"
    },
    width: {
      type: String,
      value: ""
    },
    color: {
      type: String,
      value: "random-light"
    }
  },

  ready() {
    let that = this;
    this.ctx = wx.createCanvasContext('canvas', this);
    let query = this.createSelectorQuery();
    query.select("#canvas").boundingClientRect(function (res) {
      WordCloud(that.ctx, res, {
        minSize: 8,
        list: that.data.list,
        color: that.data.color
      }, that, function (val) {
        that.setData({
          spans: val
        })
      })
    }).exec();
  }
})
