export class Recognition {
  public onResult: (result: string) => any = (result) => {};
  private _recognition: SpeechRecognition;

  constructor() {
    if ("SpeechRecognition" in window) {
      console.log(`Recognition: SpeechRecognition is supported`);
      this._recognition = new SpeechRecognition();
    } else if ("webkitSpeechRecognition" in window) {
      console.log(`Recognition: webkitSpeechRecognition is supported`);
      this._recognition = new webkitSpeechRecognition();
    } else {
      throw new Error("Recognition: Speech recognition not supported in this browser");
    }

    this._recognition.lang = "en-US";
    this._recognition.interimResults = false;
    this._recognition.maxAlternatives = 1;
    this._recognition.continuous = true;

    this._recognition.onresult = (event) => {
      console.log(`Recognition: onresult`);
      this.onResult(this.getTranscript(event));
    };

    this._recognition.onnomatch = (event) => {
      console.log(`Recognition: onnomach`);
      //this.onResult(this.getTranscript(event));
    };

    this._recognition.onend = () => {
      console.log(`Recognition: onend`);
      if (this._recognition.continuous)
      {
        this._recognition.start();
      }
    };

    this._recognition.onerror = (event) => {
      console.log(`Recognition: onerror - ${event.error}`);
      // if aborted, then restart
      if (event.error === "aborted") {
        this._recognition.start();
      }
    }

    this._recognition.onstart = () => {
      console.log(`Recognition: onstart`);
    }
  }

  private getTranscript(event: SpeechRecognitionEvent) {
    if(!this._recognition.continuous) {
      return event.results[0][0].transcript;
    }

    const results = event.results;
    if (!results) { return ""; }
    const len = results.length;
    if (len > 0) {
      const result = results[len - 1][0].transcript;
      console.log(`Recognition: Result - ${result}`);
      return result;
    }
    return "";
  }

  public start() {
    console.log(`Recognition: Started`);
    this._recognition.start();
  }

  public stop() {
    console.log(`Recognition: Stopped`);
    this._recognition.stop();
  }
}
