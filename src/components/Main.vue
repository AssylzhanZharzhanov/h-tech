
<template>
  <div>
    <div class="main">
      <h2>H-Tech <span>Systems</span></h2>
      <div class="d-flex flex-column justify-content-center align-items-center content mt-3">
        <div v-if="!isNext" class="card w-50 h-75">
          <div class="card-header text-center">Запрос</div>
          <div class="card-body result my-2">
            <div v-if="isActive && transcription.length <= 0" class="d-flex justify-content-center mt-4">
              Говорите...
            </div>
            <span id="output" v-for="item in transcription">{{item}} </span>
          </div>
        </div>
        <div v-if="isNext" class="card w-75 h-75">
          <div class="card-header text-center">Медицинская выписка</div>
          <div class="card-body result">
            <div v-for="item in parsed">
              <span class="badge">{{capitalize(item['keyword'])}}</span>:
              <span class="label">{{item['value']}}</span>
            </div>
          </div>
        </div>
        <div class="d-flex">
          <div v-if="!isNext" class="d-flex justify-content-center align-items-center action pulse mt-4 mx-3" @click="reset()" aria-disabled="true">
            <i class="fas fa-undo"></i>
          </div>
          <div v-if="!isNext" class="d-flex justify-content-center align-items-center action pulse mt-4 mx-3" @click="activate()">
            <i :class="(isActive) ? 'fas fa-stop' : 'fas fa-play'"></i>
          </div>
          <div v-if="!isNext" class="d-flex justify-content-center align-items-center action pulse mt-4 mx-3" @click="next()">
            <i class="fas fa-arrow-right"></i>
          </div>
          <div v-if="isNext" class="d-flex justify-content-center align-items-center action pulse mt-4 mx-3" @click="back()">
            <i class="fas fa-arrow-left"></i>
          </div>
          <div v-if="isNext" class="d-flex justify-content-center align-items-center action pulse mt-4 mx-3" @click="insert()">
            <i class="far fa-save fa-lg"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="https://www.gstatic.com/firebasejs/4.13.0/firebase.js"></script>
<script>
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBuKK7PR3RR0eheOHnIVBhWkzCDZSNfyJg",
    authDomain: "swift-capsule-221215.firebaseapp.com",
    databaseURL: "https://swift-capsule-221215.firebaseio.com/",
    projectId: "swift-capsule-221215",
    storageBucket: "",
  };
  firebase.initializeApp(config);

</script>
<script>
import {data as dataOriginal} from '@/components/scripts/keywords'
import firebase from 'firebase'
export default {
  name: 'Main',
  data() {
    return {
      recognition: null,
      runtimeTranscription: '',
      transcription: [],
      text: '',
      previousData: {index: -1},
      parsed: [],
      data: [],
      buffer: '',
      type: String,
      language: 'ru-RU',
      isActive: false,
      isNext: false,
      array: [],
    }
  },
  methods: {
    checkApi () {
      window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognition && process.env.NODE_ENV !== 'production') {
        throw new Error('Speech Recognition does not exist on this browser. Use Chrome or Firefox')
      }
      if (!SpeechRecognition) {
        return
      }
      this.recognition = new SpeechRecognition()
      this.recognition.lang = this.language
      this.recognition.interimResults = true
      this.recognition.addEventListener('result', event => {
        const text = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('')
        this.runtimeTranscription = text
      })
      this.recognition.addEventListener('end', () => {
        if (this.runtimeTranscription !== '') {
          this.transcription.push(this.runtimeTranscription)
          this.$emit('onTranscriptionEnd', {
            transcription: this.transcription,
            lastSentence: this.runtimeTranscription
          })
        }
        this.runtimeTranscription = ''
        this.recognition.start()
      })
      this.recognition.start()
    },
    activate() {
      if (!this.isActive) {
        this.checkApi()
        this.isActive = true
      } else {
        this.isActive = false
        this.recognition.stop()
        this.recognition = null
      }
    },
    reset() {
      if (this.transcription <= 0) {
        return
      }
      this.transcription = []
      this.parsed = []
      this.text = ''
      this.previousData=  {index: -1}
      this.buffer = ''
      this.array = []
    },
    back() {
      this.isNext = false
    },
    next() {
      if (this.transcription.length <= 0) {
        return
      }
      if (this.text.length == 0){
        this.text = this.transcription.join(' ')
        this.data = dataOriginal
        this.isNext = false
        this.parseText()
      }
      else{
        this.isNext = true
      }
    },
    parseText() {
      let temporary = ""
      for (let i = 0; i < this.text.length; i++) {
        this.buffer += this.text[i]
        if (this.text[i] !== ' ' || i==this.text.length-1) {
          let current = this.tryToGetKeyword()
          if (current.index !== -1) {
            if (this.previousData.index !== -1) {
              temporary = this.buffer.substr(0, current.position)
              this.parsed.push(this.getNormalizedValue(temporary))
              this.buffer = this.buffer.replace(temporary, '')
            }
            this.previousData = current
          }
        }
      }
      this.data.forEach((el) => {
        var flag = true;
        el.data.forEach((word) => {
          this.parsed.forEach((key) => {
            if (key == word) {
              flag = false;
            }
          });
        });
        if (flag) {
          this.parsed.push({keyword: el.label, value: 'нет'});
        }
      })
    },
    insert(){
       // console.log(this.parsed)
      for(var i = 0; i<this.parsed['length']; i++){
        if (this.parsed[i].keyword === 'Пол'){
          this.array.push({'Пол' : this.parsed[i].value})
        }
        if (this.parsed[i].keyword === 'Дата рождения'){
          // var val = this.parsed[i].value
          // var splitted_date = val.split(" ");
          // console.log(splitted_date, val)
          // var year = splitted_date[2];
          // var age = 2018 - parseInt(year);
          // this.array.push({'Возраст' : age});
          this.array.push({'Дата рождения' : this.parsed[i].value});
        }
        if (this.parsed[i].keyword === 'Предварительный диагноз'){
            this.array.push({'Диагноз' : this.parsed[i].value});
        }
      }
      console.log(this.array)
      var database = firebase.database();

      database.ref('ids').set(this.array)
      // console.log(database)
    },
    tryToGetKeyword() {
      let maximumLength = 0
      let dataIndex = -1
      let index = -1
      let position = -1
      let temporary = ''
      let value

      for (let i = 0; i < this.data.length; i++) {
        let element = this.data[i]
        element.data.forEach((keyword) => {
          index = this.buffer.toLowerCase().indexOf(keyword.toLowerCase())
          if (index !== -1) {
            if (maximumLength < keyword.length) {
              position = index
              maximumLength = keyword.length
              dataIndex = i
            }
          }
        })
      }
      if (dataIndex !== -1) {
        temporary = this.data[dataIndex].data.slice()
        value = this.data[dataIndex].label
        this.data.splice(dataIndex, 1)
      }
      return {
        value: value,
        keywords: temporary,
        index: dataIndex,
        position: position
      }
    },
    getNormalizedValue(value) {
      let maximumLength = 0
      let maximumKeyword = ''
      let index

      for (let i in this.previousData.keywords) {
        let keyword = this.previousData.keywords[i]
        index = value.toLowerCase().indexOf(keyword.toLowerCase())
        if (index !== -1) {
          if (maximumLength < keyword.length) {
            maximumLength = keyword.length
            maximumKeyword = keyword
          }
        }
      }
      return {
        keyword: this.previousData.value,
        value: value.toLowerCase().replace(maximumKeyword.toLowerCase(), '').replace(/^\s+|\s+$/gm, '')
      }
    },
    capitalize(text) {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    }
  }
}
</script>
