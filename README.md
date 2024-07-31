KORG Internship Web Synthesizer

JavaScriptを用いたWebブラウザ上で動作する簡単なシンセサイザー

## 開発手順

1. 開発にあたってNode.jsを使用するので以下の手順に従ってインストールする（すでにインストール済みの場合は次のステップへ）  
https://www.sejuku.net/blog/72545  
Node.jsとは何かについては以下の記事がわかりやすいです。
https://qiita.com/non_cal/items/a8fee0b7ad96e67713eb

2. ファイルをダウンロードする。  
GitHubアカウントを持っている方はこのリポジトリをローカルにクローンしてください。  
その他の方は右上の <span style="color: green; "><>Code</span> ボタンから”Download ZIP”を選択してダウンロードしたフォルダを解凍し適当な場所に置いてください。  
<img width="300" src="./code_button.png">

3. コマンドラインツールを使用して以下を実行  

```
cd ~~~/internship-2024-summer/app　 //プロジェクトフォルダに移動  
npm ci　　　　　　　　　　　　　　　　　　//必要なnode.jsのパッケージを自動インストール  
npm run dev 　　　　　　　　　　　　　　 //ローカルホストに実行環境を立ち上げる
```


4. 以下のような結果が出力されるのでChromeなどのブラウザから http://localhost:~~~~/ にアクセスするとページが表示される

```
> test@0.0.0 dev
> vite


  VITE v5.3.5  ready in 181 ms

  ➜  Local:   http://localhost:~~~~/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

5. 実装ファイルの内容を編集して保存すると自動的にページが更新されます。（場合によってはページのリロードが必要な時もあります）  
エラーログなどはブラウザのデベロッパーツールを使って確認することができます。

## 実装の概要

フォルダ構成
```
app
├── index.html
├── node_modules/
├── package-lock.json
├── package.json
├── public/
│   ├── SynthesizerWorklet.js   //シンセサイザー（Osc,Amp,Filter,etc..）の音声信号処理
│   └── vite.svg
├── src/
│   ├── .DS_Store
│   ├── App.vue                 //アプリのメイン
│   ├── assets/                 //画像データなどの置き場
│   │   └──  korg.jpg
│   ├── components/            
│   │   ├── AmpUI.vue           //AmpセクションのUI
│   │   ├── FilterUI.vue        //FilterセクションのUI
│   │   ├── OscillatorUI.vue    //OscillatorセクションのUI
│   │   └── WaveDisplay.vue     //波形表示セクション
│   ├── main.js
│   └── style.css               //スタイル
└── vite.config.js
```

このWebアプリはVueというJavaScript用のフレームワークを利用してUIを構築しています。  
Vueを利用するメリットについては以下の記事がわかりやすいです。  
https://www.webstaff.jp/guide/trend/webit/vuejs/  
＊Vue3では記法が2つあり、現在はComposition APIという形式が主流のようですが、このアプリはVue2で主流だったOptions APIの形式で書かれています。よって書き方を調べる場合にはVue2の記事などを参考にしたほうがわかりやすいかもしれません。

みなさんに触ってもらうのは主に上記のコメントが書かれたファイルになると思います。　　
以下ファイルについての説明です。

### App.vue
このアプリのメイン実装ファイルです。

Vueファイルは主に

- templateタグ：html要素を埋め込む
- scriptタグ：javascriptを記載する
- styleタグ：cssを記載する

の三部分からなります。  
これらを合わせて一つの部品としてコンポーネントを作成し、それらを組み合わせて1つのWebページを作るのがVue.jsの大枠の考え方です。

よって、シンセサイザーの各セクションのUIはそれぞれ独立した子コンポーネントとしてcomponents/~.vueファイルに実装されており、それらがApp.vue（親コンポーネント）にインポートされています。  
また、App.vueではAudioWorkletの生成、およびUIコンポーネントからAudioWorkletへのパラメーターの受け渡しが実装されています。  
AudioWorkletとは、Web Audio APIの仕様の一つでメインスレッドとは異なるワーカースレッドを使用して低遅延の音声処理を提供するための機能です。  
今回のWebシンセサイザーは信号処理部にこのAudioWorkletを用いており、その実装はSynthesizerWorklet.jsに記述されています。

### parameterDescriptor.js
このファイルにシンセサイザーのパラメーターを記述します。

- parameters  
このオブジェクト内に必要なパラメーターの情報をまとめて各UIコンポーネントやAudioWorkletから参照できるようにしています。新たにパラメーターを追加したい場合はここに書き足していくと良いでしょう。


### SynthesizerWorklet.js
このファイルにはシンセサイザーの信号処理を行うAudioWorkletの実装が書かれています。
実際の処理はprocess関数の中に記述します。

#### process(inputs, outputs, parameters) {// シンセサイザーのDSP }
- inputs  
入力される信号の配列です。このシンセサイザーにはオーディオインプットは存在しないので使用しません。

- outputs  
出力する信号の配列です。ここに出力波形の値を入れていくことでWeb Audioによって発音させることができます。
チャンネル数 x (ステレオ or モノラル or etc.) x サンプル数 の３次元配列になっていますが、このシンセサイザーは１chのモノラル信号のみを出力するのでoutputs[0][0]が実際の出力バッファとなります。
基本的には128サンプル（つまり要素数128の配列）が１フレーム分のバッファーとして処理毎に与えられます。

- parameters  
今回はonmessageからパラメーターの更新を行うので使用しません。

### style.css 
webページの見た目を整えるためのCSSを記述します。
各コンポーネントファイルで個別に書くこともできますが、まとめ一括で指定したい場合などはここに記述すると良いでしょう。  
CSSとは↓  
https://schoo.jp/matome/article/1676



## パラメーターの受け渡し（ UI -> DSP ）
各セクションのUIで変更されたパラメータはApp.vueを経由してAudioWorkletに渡されます。

### UI -> App
Vueでは$emitを使って子コンポーネント（各UI.vue）から親コンポーネント（App.vue）のイベントを発生させることができます。
この時に引数にデータを渡すことで各UIからApp.vueにパラメータを伝えることができます。

```
//  ~UI.vue
emits: ["parameterChanged"],
.
.
methods:{
  uiParameterChanged{
    const value = 100
    this.$emit("parameterChanged", value)
  }
}

//  App.vue
<~~~UI @parameterChanged="onParameterChanged" />
.
.
methods:{
  onParameterChanged(value){
    console.log(value)  // -> 100
  }
}
```

上記とは逆に親から子へデータを渡したい時はpropsという機能を使います。  
propsとemitの使用例 -> https://qiita.com/d0ne1s/items/f88ecd6aaa90c7bbc5d4

### App -> DSP
AudioWorkletにパラメータを伝える方法はprocess関数の引数（parameters）として渡す方法とMessagePortを使う方法の２種類がありますが、今回は後者を利用しています。
App.vueでAudioWorkletのpostMessageを呼び出すと、AudioWorkletのconstructor内で定義したonmessageが実行されデータを伝えることができます。

```
//  App.vue
const data = 100
AudioWorklet.port.postMessage(data)

//  AudioWorklet.js
constructor(options) {
  this.port.onmessage = (event) => {
    console.log(event.data);  //  -> 100
  }
}
```



