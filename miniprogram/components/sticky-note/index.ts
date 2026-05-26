import type { Note } from '../../types/domain';

Component({
  properties: {
    note: {
      type: Object,
      value: {}
    }
  },
  methods: {
    onTap() {
      const note = (this.properties as unknown as { note: Note }).note;
      this.triggerEvent('tapnote', { note });
    }
  }
});
