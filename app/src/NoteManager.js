//  レガート奏法に対応するために押鍵されているのノートを記録しておくためのクラス

class NoteManager {
    constructor() {
        this.activeNotes = []; //   空の配列を定義
    }

    //  押鍵されたノートナンバーを配列（activeNotes）に追加
    noteOn(noteNumber) {
        if (!this.activeNotes.includes(noteNumber)) {
            this.activeNotes.push(noteNumber);
        }
    }

    //  離鍵されたノートナンバーを配列（activeNotes）から削除
    noteOff(noteNumber) {
        const index = this.activeNotes.indexOf(noteNumber); //  配列からノートナンバーを検索
        // 配列内に存在する場合は削除
        if (index !== -1) {
            this.activeNotes.splice(index, 1);
        }
    }

    //  現在押鍵されているノートナンバーのうち一番最後に押鍵されたノートナンバーを返す
    getCurrentNote() {
        if (this.activeNotes.length > 0) {
            return this.activeNotes[this.activeNotes.length - 1];
        }
        return null; // 押鍵されているノートがない場合
    }
}

export default new NoteManager();
