const KEY_MAP = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    w: 'up',
    s: 'down',
    a: 'left',
    d: 'right'
};

export class InputController {
    constructor(padElement) {
        this.buffer = null;
        this.enabled = true;
        this.handleKeyDown = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.handleKeyDown);
        if (padElement) {
            padElement.addEventListener('click', (event) => {
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                const dir = target.dataset.direction;
                if (dir) {
                    this.queue(dir);
                }
            });
        }
    }

    handleKeyDown(event) {
        if (!this.enabled) return;
        const dir = KEY_MAP[event.key];
        if (dir) {
            event.preventDefault();
            this.queue(dir);
        }
    }

    queue(dir) {
        this.buffer = dir;
    }

    consume() {
        const dir = this.buffer;
        this.buffer = null;
        return dir;
    }

    setEnabled(state) {
        this.enabled = state;
    }
}
