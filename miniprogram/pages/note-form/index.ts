import type { Note, NoteColor, Place } from '../../types/domain';
import { callFunction, showError } from '../../utils/cloud';
import { chooseAndUploadImages } from '../../utils/file';

const colors = [
  { value: 'yellow', label: '暖黄' },
  { value: 'pink', label: '浅粉' },
  { value: 'green', label: '浅绿' },
  { value: 'blue', label: '浅蓝' }
];

Page({
  data: {
    colors,
    saving: false,
    place: null as Place | null,
    form: {
      placeId: '',
      noteId: '',
      text: '',
      color: 'yellow' as NoteColor,
      photoFileId: '',
      photoUrl: ''
    }
  },
  async onLoad(query: Record<string, string>) {
    this.setData({ form: Object.assign({}, this.data.form, { placeId: query.placeId || '', noteId: query.noteId || '' }) });
    await this.loadPlaceAndNote();
  },
  async loadPlaceAndNote() {
    try {
      const { place, notes } = await callFunction<{ place: Place; notes: Note[] }>('getPlaceDetail', {
        placeId: this.data.form.placeId
      });
      const note = notes.find((item) => item._id === this.data.form.noteId);
      this.setData({
        place,
        form: note
          ? {
              placeId: note.placeId,
              noteId: note._id,
              text: note.text,
              color: note.color,
              photoFileId: note.photoFileId,
              photoUrl: note.photoUrl || note.photoFileId
            }
          : this.data.form
      });
    } catch (error) {
      showError(error);
    }
  },
  onTextInput(event: WechatMiniprogram.Input) {
    this.setData({ form: Object.assign({}, this.data.form, { text: event.detail.value }) });
  },
  onColorTap(event: WechatMiniprogram.TouchEvent) {
    const color = event.currentTarget.dataset.value as NoteColor;
    this.setData({ form: Object.assign({}, this.data.form, { color }) });
  },
  async onUpload() {
    if (!this.data.place) return;
    try {
      const fileIds = await chooseAndUploadImages(this.data.place.spaceId, 1, 'notes');
      this.setData({ form: Object.assign({}, this.data.form, { photoFileId: fileIds[0] || '', photoUrl: fileIds[0] || '' }) });
    } catch (error) {
      showError(error);
    }
  },
  async onSave() {
    if (!this.data.form.text && !this.data.form.photoFileId) {
      wx.showToast({ title: '请写文字或贴照片', icon: 'none' });
      return;
    }
    this.setData({ saving: true });
    try {
      const name = this.data.form.noteId ? 'updateNote' : 'createNote';
      await callFunction(name, this.data.form);
      wx.navigateBack();
    } catch (error) {
      showError(error);
    } finally {
      this.setData({ saving: false });
    }
  },
  onDelete() {
    wx.showModal({
      title: '删除便利贴',
      content: '确认删除这张便利贴吗？',
      confirmColor: '#E94B43',
      success: async (result) => {
        if (!result.confirm) return;
        try {
          await callFunction('deleteNote', { noteId: this.data.form.noteId });
          wx.navigateBack();
        } catch (error) {
          showError(error);
        }
      }
    });
  }
});
