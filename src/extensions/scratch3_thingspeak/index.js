const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const msg = require('./translation');
const formatMessage = require('format-message');

const menuIconURI = null;
const blockIconURI = null;

const defaultValue = '';
let theLocale = null;

class ThingSpeak {
    constructor (runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        // communication related
        this.comm = runtime.ioDevices.comm;
        this.session = null;
        this.runtime.registerPeripheralExtension('gasoThingSpeak', this);
        // session callbacks
        this.reporter = null;
        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);
        this.write = this.write.bind(this);
        // string op
        this.decoder = new TextDecoder();
        this.lineBuffer = '';
    }

    onclose () {
        this.session = null;
    }

    write (data, parser = null) {
        if (this.session) {
            return new Promise(resolve => {
                if (parser) {
                    this.reporter = {
                        parser,
                        resolve
                    };
                }
                this.session.write(data);
            });
        }
    }

    onmessage (data) {
        const dataStr = this.decoder.decode(data);
        this.lineBuffer += dataStr;
        if (this.lineBuffer.indexOf('\n') !== -1){
            const lines = this.lineBuffer.split('\n');
            this.lineBuffer = lines.pop();
            for (const l of lines) {
                if (this.reporter) {
                    const {parser, resolve} = this.reporter;
                    resolve(parser(l));
                }
            }
        }
    }

    scan () {
        this.comm.getDeviceList().then(result => {
            this.runtime.emit(this.runtime.constructor.PERIPHERAL_LIST_UPDATE, result);
        });
    }

    _setLocale () {
        let nowLocale = '';
        switch (formatMessage.setup().locale) {
        case 'zh-tw':
            nowLocale = 'zh-tw';
            break;
        default:
            nowLocale = 'en';
            break;
        }
        return nowLocale;
    }

    getInfo () {
        theLocale = this._setLocale();

        return {
            id: 'gasoThingSpeak',
            name: msg.name[theLocale],
            color1: '#4a90e2',
            color2: '#4a90e2',
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'fetchThingSpeak',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        key: {
                            type: ArgumentType.STRING,
                            defaultValue: 'key'
                        },
                        value1: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        value2: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        value3: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        value4: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        value5: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        value6: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        value7: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                        value8: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        }
                    },
                    text: msg.fetchThingSpeak[theLocale]
                }
            ]
        };
    }

    fetchThingSpeak (args) {
        const key = args.key;
        const value1 = args.value1 || defaultValue;
        const value2 = args.value2 || defaultValue;
        const value3 = args.value3 || defaultValue;
        const value4 = args.value4 || defaultValue;
        const value5 = args.value5 || defaultValue;
        const value6 = args.value6 || defaultValue;
        const value7 = args.value7 || defaultValue;
        const value8 = args.value8 || defaultValue;
        const originalURL = `https://api.thingspeak.com/update?api_key=${key}&field1=${value1}&field2=${value2}&field3=${value3}&field4=${value4}&field5=${value5}&field6=${value6}&field7=${value7}&field8=${value8}`;
        // https://developer.mozilla.org/zh-TW/docs/Web/API/Fetch_API/Using_Fetch
        return fetch(originalURL, {
            mode: 'no-cors',
            method: 'GET'
            // body: encodeURIComponent(JSON.stringify({value1, value2, value3}))
        }).catch(error => console.error('Error:', error));
    }
}

module.exports = ThingSpeak;
