import type { Note } from '../../types/domain';

Component({
  properties: {
    note: {
      type: Object,
      value: null
    }
  },
  methods: {
    onTap() {
      const note = this.properties.note as Note;
      this.triggerEvent('tapnote', { note });
    }
  }
});
