/**
 * Widget for playing audio
 */
define([], function () {
    var CHANGE = 'change',
        DATABINDING = 'dataBinding',
        DATABOUND = 'dataBound',
        DURATIONCHANGE = 'durationchange',
        ENDED = 'ended',
        ERROR = 'error',
        LOADEDDATA = 'loadeddata',
        LOADEDMETADATA = 'loadedmetadata',
        LOADSTART = 'loadstart',
        PAUSE = 'pause',
        PLAY = 'play',
        PLAYING = 'playing',
        PROGRESS = 'progress',
        RATECHANGE = 'ratechange',
        SEEKED = 'seeked',
        SEEKING = 'seeking',
        TIMEUPDATE = 'timeupdate',
        VOLUMECHANGE = 'volumechange',
        PLAYLISTENDED = 'playlistEnded';

    kendo.ui.plugin(kendo.ui.Widget.extend({
        mediaElement: null,
        contentElement: null,
        dataSource: null,

        /**
         * Constructor
         * @param element
         * @param options
         */
        init: function (element, options) {
            //BASE CALL TO WIDGET INITIALIZATION
            kendo.ui.Widget.fn.init.call(this, element, options);

            //ADD CSS TO WIDGET FOR STYLING
            this.element.addClass('k-mediaplayer');

            //INITIALIZE PARTS
            this.initStyles();
            this.initElements();
            this.initEvents();
            this.initDataSource();
        },

        /**
         * Widget options for initialization
         */
        options: {
            name: 'MediaPlayer',
            type: 'audio',
            preload: 'auto',
            autoBind: true,
            autoPlay: false,
            enableControls: true,
            enableLoop: false,
            enableLoopAll: true,
            enableContinuous: true,
            enablePlaylist: true,
            enableStyles: true,
            playSelector: null,
            pauseSelector: null,
            stopSelector: null,
            previousSelector: null,
            nextSelector: null,
            controlsSelector: null,
            loopSelector: null,
            loopAllSelector: null,
            continuousSelector: null,
            template: '',
            playlistTemplate: ''
        },

        /**
         * Public API events used by widgets or MVVM
         */
        events: [
            //Called before mutating DOM
            DATABINDING,
            //Called after mutating DOM
            DATABOUND,
            //The metadata has loaded or changed, indicating a change in duration of the media.  This is sent, for example, when the media has loaded enough that the duration is known.
            DURATIONCHANGE,
            //Sent when playback completes.
            ENDED,
            //Sent when an error occurs.  The element's error attribute contains more information.
            ERROR,
            //The first frame of the media has finished loading.
            LOADEDDATA,
            //The media's metadata has finished loading; all attributes now contain as much useful information as they're going to.
            LOADEDMETADATA,
            //Sent when loading of the media begins.
            LOADSTART,
            //Sent when playback is paused.
            PAUSE,
            //Sent when playback of the media starts after having been paused; that is, when playback is resumed after a prior pause event.
            PLAY,
            //Sent when the media begins to play (either for the first time, after having been paused, or after ending and then restarting).
            PLAYING,
            //Sent periodically to inform interested parties of progress downloading the media. Information about the current amount of the media that has been downloaded is available in the media element's buffered attribute.
            PROGRESS,
            //Sent when the playback speed changes.
            RATECHANGE,
            //Sent when a seek operation completes.
            SEEKED,
            //Sent when a seek operation begins.
            SEEKING,
            //The time indicated by the element's currentTime attribute has changed.
            TIMEUPDATE,
            //Sent when the audio volume changes (both when the volume is set and when the muted attribute is changed).
            VOLUMECHANGE,
            //Sent when playlist completes.
            PLAYLISTENDED
        ],

        /**
         * Register CSS style rules
         */
        initStyles: function () {
            //ADD CSS RULES DYNAMICALLY
            var addCssRule = function(styles) {
                var style = document.createElement('style');
                style.type = 'text/css';

                if (style.styleSheet) style.styleSheet.cssText = styles; //IE
                else style.innerHTML = styles; //OTHERS

                document.getElementsByTagName('head')[0].appendChild(style);
            };

            if (this.options.enableStyles) {
                //ADD CSS RULES FOR WIDGET
                addCssRule('.k-mediaplayer { width: 99%; padding: 10px; }');
                addCssRule('.km-root .k-mediaplayer { width: 100%; }');
                addCssRule('.k-mediaplayer audio, .k-mediaplayer video { width: 100%; }');
                addCssRule('.k-mediaplayer .playlist { padding: 0; margin: 0;  border-top: 1px dotted #ccc; }');
                addCssRule('.k-mediaplayer .playlist li { cursor: pointer; list-style: none; padding: 3px; padding: 10px; border: 1px dotted #ccc; border-top: none; }');
                addCssRule('.k-mediaplayer .playlist li:hover, .k-mediaplayer .playlist li.selected { background-color: #ddd; }');
            }
        },

        /**
         * Create templates for rendering to DOM
         */
        initElements: function () {
            var templateHtml = '';

            //BUILD AND CACHE OUTPUT FOR RENDERING MEDIA CONTROL
            this.element.html(this._createMediaTag());
            this.mediaElement = this.element.find(this.options.type)[0];

            //BUILD PLAYLIST TEMPLATE IF APPLICABLE
            if (this.options.enablePlaylist) {
                //BUILD OUTPUT FOR RENDERING PLAYLIST
                templateHtml += this.options.playlistTemplate
                    || ('<ul class="playlist"># for (var i = 0; i < data.length; i++) { #'
                    + '<li data-file="#= data[i].file #">#= data[i].title #</li>'
                    + '# } #</ul>');
            }

            //CACHE CONTENT PLACEHOLDERS FOR LATER USE
            this.element.append('<div class="content-wrapper"></div>');
            this.contentElement = this.element.find('.content-wrapper');

            //COMPILE TEMPLATE FOR LATER USE
            this.template = kendo.template(templateHtml);
        },

        /**
         * Bind events
         */
        initEvents: function () {
            var me = this;
            var $document = $(document.body);

            //DETERMINE CLICK EVENT TO USE
            //http://stackoverflow.com/questions/10165141/jquery-on-and-delegate-doesnt-work-on-ipad
            var clickEventName = (kendo.support.mobileOS && kendo.support.mobileOS.browser == 'mobilesafari')
                ? 'touchstart' : 'click';

            //BIND MEDIA EVENTS (FOR NON-MVVM)
            this._bindMedia(DURATIONCHANGE, this.options.durationChange);
            this._bindMedia(ENDED, this.options.ended);
            this._bindMedia(ERROR, this.options.error);
            this._bindMedia(LOADEDDATA, this.options.loadedData);
            this._bindMedia(LOADEDMETADATA, this.options.loadedMetadata);
            this._bindMedia(LOADSTART, this.options.loadStart);
            this._bindMedia(PAUSE, this.options.pause);
            this._bindMedia(PLAY, this.options.play);
            this._bindMedia(PLAYING, this.options.playing);
            this._bindMedia(PROGRESS, this.options.progress);
            this._bindMedia(RATECHANGE, this.options.rateChange);
            this._bindMedia(SEEKED, this.options.seeked);
            this._bindMedia(SEEKING, this.options.seeking);
            this._bindMedia(TIMEUPDATE, this.options.timeUpdate);
            this._bindMedia(VOLUMECHANGE, this.options.volumeChange);

            //HANDLE PLAYLIST IF APPLICABLE
            this._bindMedia(ENDED, function () {
                //HANDLE LAST ITEM IF APPLICABLE
                if (me.isLastMedia()) {
                    //EXECUTE CALLBACK FOR ENDED PLAYLIST
                    me.trigger(PLAYLISTENDED);

                    //LOOP TO BEGINNING IF APPLICABLE
                    if (me.options.enableLoopAll) {
                        me.next();
                    } else {
                        me.stop();
                    }
                } else {
                    //PLAY NEXT ITEM IN PLAYLIST IF APPLICABLE
                    if (me.options.enableContinuous) {
                        me.next();
                    } else {
                        me.stop();
                    }
                }
            });

            //HANDLE PLAYLIST ENDED EVENT IF APPLICABLE (FOR NON-MVVM)
            if (this.options.playlistEnded) {
                this.bind(PLAYLISTENDED, this.options.playlistEnded);
            }

            //SCRUB MEDIA PROPERTIES IF NEEDED
            this.bind(DATABINDING, function () {
                var data = this.dataSource.data();

                //ITERATE THROUGH MEDIA
                for (var i = 0; i < data.length; i++) {
                    //ASSIGN TITLE IF APPLICABLE
                    if (!data[i].title) {
                        data[i].title = me._convertFileToTitle(data[i].file);
                    }
                }
            });

            //HANDLE PLAYLIST EVENTS
            if (this.options.enablePlaylist) {
                //ALLOW NAVIGATION OF PLAYLIST ITEMS
                this.contentElement.on('click', '.playlist li', function () {
                    //LOAD SELECTED ITEM FROM PLAYLIST
                    me.play($(this).attr('data-file'));
                });
            }

            //SUBSCRIBE EVENTS TO CUSTOM SELECTORS IF APPLICABLE
            if (this.options.playSelector) {
                $document.on(clickEventName, this.options.playSelector, function (e) {
                    e.preventDefault();
                    me.play();
                });
            }

            if (this.options.pauseSelector) {
                $document.on(clickEventName, this.options.pauseSelector, function (e) {
                    e.preventDefault();
                    me.pause();
                });
            }

            if (this.options.stopSelector) {
                $document.on(clickEventName, this.options.stopSelector, function (e) {
                    e.preventDefault();
                    me.stop();
                });
            }

            if (this.options.previousSelector) {
                $document.on(clickEventName, this.options.previousSelector, function (e) {
                    e.preventDefault();
                    me.previous();
                });
            }

            if (this.options.nextSelector) {
                $document.on(clickEventName, this.options.nextSelector, function (e) {
                    e.preventDefault();
                    me.next();
                });
            }
        },

        /**
         * Creates the data source
         */
        initDataSource: function() {
            //IF DATA SOURCE IS DEFINED AND THE REFRESH HANDLER IS WIRED UP,
            //UNBIND BECAUSE DATA SOURCE MUST BE REBUILT
            if (this.dataSource && this._refreshHandler) {
                //UNBIND SO BINDING CAN BE WIRED UP AFTER DATA SOURCE CREATION
                this.dataSource.unbind(CHANGE, this._refreshHandler);
            }
            else {
                //CREATE CONNECTION BETWEEN INTERNAL _refreshHandler AND PUBLIC REFRESH FUNCTION
                this._refreshHandler = $.proxy(this.refresh, this);
            }

            //CREATE DATA SOURCE FROM ARRAY OR CONFIG OBJECT
            this.dataSource = kendo.data.DataSource.create(this.options.dataSource);

            //NOW BIND DATA SOURCE TO REFRESH OF WIDGET
            this.dataSource.bind(CHANGE, this._refreshHandler);

            //FETCH DATA FIRST TIME IF APPLICABLE
            if (this.options.autoBind) {
                this.dataSource.fetch();
            }
        },

        /**
         * Change data source dynamically via MVVM
         * @param dataSource
         */
        setDataSource: function(dataSource) {
            //SET THE INTERNAL DATA SOURCE EQUAL TO THE ONE PASSED IN BY MVVM
            this.options.dataSource = dataSource;

            //REBUILD THE DATA SOURCE IF NECESSARY OR JUST REASSIGN
            this.initDataSource();
        },

        /**
         * DOM elements that represent the output for MVVM
         */
        items: function() {
            return this.element.find('.playlist li');
        },

        /**
         * Re-renders the widget with all associated data
         */
        refresh: function() {
            //TRIGGER DATA BINDING BEFORE RENDER
            this.trigger(DATABINDING);

            //INITIALIZE VARIABLES
            var view = this.dataSource.view(),
                html = view.length ? this.template(view) : '';

            //RENDER DATA TO DOM PLACEHOLDER
            this.contentElement.html(html);

            //REPLACE MEDIA DOM ELEMENT IF APPLICABLE
            if (this.options.type != this.mediaElement.tagName.toLowerCase()) {
                var temp = $(this._createMediaTag());
                $(this.mediaElement).replaceWith(temp);
                this.mediaElement = temp[0];
            }

            //POPULATE FIRST MEDIA IF NONE LOADED OR DOES NOT EXIST
            if (view.length
                && (!this.mediaSrc() || !this.getMediaByFile(this.mediaSrc()))) {
                this.mediaSrc(view[0].file);
                this.refreshDisplay();
            }

            //TRIGGER DATA BINDING AFTER RENDER COMPLETE
            this.trigger(DATABOUND);
        },

        /**
         * Updates the interface based on new or updated media
         */
        refreshDisplay: function () {
            var me = this;
            var playlistItems = this.contentElement.find('.playlist li');

            //RESET DISPLAY
            playlistItems.removeClass('selected');

            //SELECT ACTIVE MEDIA FROM PLAYLIST IF APPLICABLE
            if (this.mediaSrc()) {
                playlistItems.each(function () {
                    var $this = $(this);

                    //MATCH LOADED MEDIA TO PLAYLIST ITEM
                    if ($this.attr('data-file') == me.mediaSrc()) {
                        //ACTIVATE ELEMENT
                        $this.addClass('selected');
                        return false;
                    }
                });
            }
        },

        /**
         * Set media source for HTML element
         * @param value
         */
        mediaSrc: function (value) {
            if (value || value === '') {
                this.mediaElement.src = value;
                if (value) this.mediaElement.load();
            }

            return $(this.mediaElement).attr('src');
        },

        /**
         * Gets media by file from data source
         * @param value
         */
        getMediaByFile: function (value) {
            //VALIDATE INPUT
            if (!value) return;

            var data = this.dataSource.data();

            for (var i = 0; i < data.length; i++) {
                //FIND MATCHING MEDIA FRoM DATA SOURCE
                if (value == data[i].file) {
                    return data[i];
                    break;
                }
            }
        },

        /**
         * Get currently loaded media
         * @returns {*}
         */
        getLoadedMedia: function () {
            return this.getMediaByFile(this.mediaSrc());
        },

        /**
         * Is the loaded media the last in the playlist
         * @returns {boolean}
         */
        isLastMedia: function () {
            //VALIDATE
            if (!this.mediaSrc() || !this.dataSource.total())
                return false;

            //DETERMINE IF LOADED MEDIA IS THE LAST TO PLAY
            return this.getLoadedMedia().file
                == this.dataSource.at(this.dataSource.total() - 1).file;
        },

        /**
         * Add media to data source
         * @param value
         */
        add: function (value) {
            //VALIDATE INPUT
            if (!value) return;

            //CONVERT FILE TO OBJECT IF APPLICABLE
            if (typeof value == 'string') {
                value = {
                    file: value
                };
            }

            if (value.file) {
                //ASSIGN TITLE IF APPLICABLE
                if (!value.title) {
                    value.title = this._convertFileToTitle(value.file);
                }

                //ADD TO DATA SOURCE AND RETURN VALUE
                this.dataSource.add(value);
                return value;
            }
        },

        /**
         * Plays media
         */
        play: function (value) {
            //HANDLE SUPPLIED MEDIA IF APPLICABLE
            if (value) {
                //RETRIEVE DATA FROM SOURCE IF APPLICABLE
                if (typeof value == 'string') {
                    //ADD OR GET EXISTING MEDIA OBJECT
                    value = this.getMediaByFile(value)
                        || this.add(value);
                } else if (!this.getMediaByFile(value.file)) {
                    //ADD TO DATA SOURCE IF APPLICABLE
                    value = this.add(value);
                }

                //LOAD MEDIA TO PLAYER
                this.mediaSrc(value.file);
            }

            //POPULATE FIRST MEDIA IF APPLICABLE
            if (!this.mediaSrc() && this.dataSource.total()) {
                this.mediaSrc(this.dataSource.at(0).file);
            }

            //PLAY MEDIA
            this.mediaElement.play();

            //UPDATE INTERFACE
            this.refreshDisplay();
        },

        /**
         * Pauses media
         */
        pause: function () {
            this.mediaElement.pause();
        },

        /**
         * Stops media
         */
        stop: function () {
            this.pause();
            this.mediaSrc('');

            //UPDATE INTERFACE
            this.refreshDisplay();
        },

        /**
         * The current rate at which the media is being played back.
         * @param value
         * @returns {*}
         */
        playbackRate: function (value) {
            if ($.isNumeric(value)) {
                this.mediaElement.playbackRate = value;
            }

            return this.mediaElement.playbackRate;
        },

        /**
         * The readiness state of the media.
         */
        readyState: function () {
            return this.mediaElement.readyState;
        },

        /**
         * Indicates whether the media is in the process of seeking to a new position.
         */
        seeking: function () {
            return this.mediaElement.seeking;
        },

        /**
         * Seek to specified seconds
         * or returns the number of seconds the browser has played
         */
        currentTime: function (value) {
            if ($.isNumeric(value)) {
                this.mediaElement.currentTime = value;
            }

            return this.mediaElement.currentTime;
        },

        /**
         * Increase or decrease volume of player
         * @param value
         * @returns volume
         */
        volume: function (value) {
            if ($.isNumeric(value)) {
                this.mediaElement.volume = value;
            }

            return this.mediaElement.volume;
        },

        /**
         * Gets or sets muting the player
         * @param value
         * @returns {*}
         */
        muted: function (value) {
            if (value === true || value === false) {
                this.mediaElement.muted = value;
            }

            return this.mediaElement.muted;
        },

        /**
         * Go to the previous media
         */
        previous: function () {
            var data = this.dataSource.data();

            for (var i = 0; i < data.length; i++) {
                if (this.mediaSrc() == data[i].file) {
                    //LAST FILE IN PLAYLIST
                    if (i == 0) {
                        this.stop();
                        break;
                    }

                    //UPDATE MEDIA PLAYER
                    this.play(data[i - 1].file);
                    break;
                }
            }
        },

        /**
         * Go to the next media
         */
        next: function () {
            var data = this.dataSource.data();

            for (var i = 0; i < data.length; i++) {
                if (this.mediaSrc() == data[i].file) {
                    //LAST FILE IN PLAYLIST
                    if (i == data.length - 1) {
                        //DETERMINE NEXT IF AT THE END
                        if (this.options.enableLoopAll) this.play(data[0].file);
                        else this.stop();
                        break;
                    }

                    //UPDATE MEDIA PLAYER
                    this.play(data[i + 1].file);
                    break;
                }
            }
        },

        /**
         * Enables or disables controls
         * @param value
         */
        toggleControls: function (value) {
            this.options.enableControls = this._toggleMediaAttribute('controls', value);
        },

        /**
         * Enables or disables loop functionality
         * @param value
         */
        toggleLoop: function (value) {
            this.options.enableLoop = this._toggleMediaAttribute('loop', value);
        },

        /**
         * Enables or disables loop all functionality
         * @param value
         */
        toggleLoopAll: function (value) {
            this.options.enableLoopAll = value
                || (value !== false && !this.options.enableLoopAll);
        },

        /**
         * Enables or disables continuous functionality
         * @param value
         */
        toggleContinuous: function (value) {
            this.options.enableContinuous = value
                || (value !== false && !this.options.enableContinuous);
        },

        /**
         * Build media tag for HTML DOM
         * @returns {string|string}
         * @private
         */
        _createMediaTag: function () {
            //BUILD MEDIA HTML TAG
            return this.options.template
                || ('<' + this.options.type + ' src=""'
                    + ' preload="' + this.options.preload + '"'
                    + (this.options.enableControls ? ' controls' : '')
                    + (this.options.enableLoop ? ' loop' : '')
                    + (this.options.autoPlay ? ' autoplay' : '')
                    + '><p>Your browser does not support the ' + this.options.type + ' element.</p>'
                    + '</' + this.options.type + '>');
        },

        /**
         * Converts file path to title
         * @param value
         * @returns {XML|string|void}
         */
        _convertFileToTitle: function (value) {
            return value ? value.split('/').pop().replace(/\.[^/.]+$/, '') : '';
        },

        /**
         * Toggles attribute on media element
         * @param attr
         * @param value
         */
        _toggleMediaAttribute: function (attr, value) {
            var enable = value || (value !== false && !this.mediaElement.hasAttribute(attr));

            if (enable) this.mediaElement.setAttribute(attr, '');
            else this.mediaElement.removeAttribute(attr);

            return enable;
        },

        /**
         * Binds event to media player
         * @param name
         * @param callback
         */
        _bindMedia: function (name, callback) {
            if (name && callback) {
                //HANDLE BINDING FOR MEDIA PLAYER AFTER RENDER
                this.bind(DATABOUND, function () {
                    if (this.mediaElement) {
                        //BIND EVENT TO MEDIA PLAYER AFTER IT RENDERS
                        this.mediaElement.addEventListener(name, callback);
                    }
                });
            }
        }

    }));

    //BASE BINDER FOR MVVM MEDIA ELEMENT EVENTS
    var MediaBinder = kendo.data.Binder.extend({
        eventName: null,

        init: function (widget, bindings, options) {
            var me = this;

            //BASE CALL TO WIDGET INITIALIZATION
            kendo.data.Binder.fn.init.call(this, widget, bindings, options);

            //HANDLE BINDING FOR MEDIA PLAYER
            widget._bindMedia(this.eventName, function () {
                me.bindings[me.eventName].get();
            });
        },

        refresh: function () {}
    });

    //CREATE WIDGET BINDERS
    kendo.data.binders.widget.mediaplayer = {

        controls: kendo.data.Binder.extend({
            refresh: function () {
                var value = this.bindings.controls.get();
                var widget = this.element;

                widget.toggleControls(value);
            }
        }),

        loop: kendo.data.Binder.extend({
            refresh: function () {
                var value = this.bindings.loop.get();
                var widget = this.element;

                widget.toggleLoop(value);
            }
        }),

        loopAll: kendo.data.Binder.extend({
            refresh: function () {
                var value = this.bindings.loopAll.get();
                var widget = this.element;

                widget.toggleLoopAll(value);
            }
        }),

        continuous: kendo.data.Binder.extend({
            refresh: function () {
                var value = this.bindings.continuous.get();
                var widget = this.element;

                widget.toggleContinuous(value);
            }
        }),

        playlistended: kendo.data.Binder.extend({
            init: function (widget, bindings, options) {
                var me = this;

                kendo.data.Binder.fn.init.call(this, widget, bindings, options);

                //HANDLE BINDING FOR MEDIA PLAYER
                widget.bind(PLAYLISTENDED, function () {
                    //EXECUTE CALLBACK OPTION
                    me.bindings.playlistended.get();
                });
            },

            refresh: function () {}
        }),

        //BIND MVVM MEDIA EVENTS
        durationchange: MediaBinder.extend({ eventName: DURATIONCHANGE }),
        ended: MediaBinder.extend({ eventName: ENDED }),
        error: MediaBinder.extend({ eventName: ERROR }),
        loadeddata: MediaBinder.extend({ eventName: LOADEDDATA }),
        loadedmetadata: MediaBinder.extend({ eventName: LOADEDMETADATA }),
        loadstart: MediaBinder.extend({ eventName: LOADSTART }),
        pause: MediaBinder.extend({ eventName: PAUSE }),
        play: MediaBinder.extend({ eventName: PLAY }),
        playing: MediaBinder.extend({ eventName: PLAYING }),
        progress: MediaBinder.extend({ eventName: PROGRESS }),
        ratechange: MediaBinder.extend({ eventName: RATECHANGE }),
        seeked: MediaBinder.extend({ eventName: SEEKED }),
        seeking: MediaBinder.extend({ eventName: SEEKING }),
        timeupdate: MediaBinder.extend({ eventName: TIMEUPDATE }),
        volumechange: MediaBinder.extend({ eventName: VOLUMECHANGE })

    };

});