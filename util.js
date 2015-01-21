(function( win ) {
    var __ = {};
    // 字符串相关处理
    __.string = {};
    (function() {
        /**
         * 对字符串进行异或操作
         * @param s1
         * @param s2
         */
        function stringxor( s1, s2 ) {
            var s = '', hash = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', max = Math.max( s1.length, s2.length );
            for ( var i = 0; i < max; i++ ) {
                var k = s1.charCodeAt( i ) ^ s2.charCodeAt( i );
                s += hash.charAt( k % 52 );
            }
        }

        /**
         * 对字符串进行哈希计算
         * @param str 目标字符串
         * @param len 哈希字符串长度，默认32
         * @returns {string} 哈希后的字符串
         */
        __.string.hash = function( str, len ) {
            len = len || 32;
            var start = 0, result = '';
            // 使用0补齐字符串为hash字符串的倍数
            str += new Array( len - str.length % len + 1 ).join( '0' );
            while ( start < str.length ) {
                result = stringxor( result, str.substr( start, len ) );
                start += len;
            }
            return result;
        };
    })();
    // url解析相关
    __.url = {
        getParam : function( name ) {
            var r = new RegExp( '[?&]' + name + '=([^&]*)' ), s = window.location.href, ret = null;
            if ( r.test( s ) ) {
                try {
                    ret = decodeURIComponent( RegExp.$1 );
                } catch ( e ) {
                }
            }
            return ret;
        }
    };
    // 模板方法
    __.tmpl = function( data, tpl, des ) {
        var $tpl = document.getElementById( tpl ), val = $tpl && $tpl.innerHTML || '';
        if ( !val ) { return; }
        var r = /<!--([\s\S]+)-->/, ary = [], strTpl = null, html = null, o = null;
        if ( r.test( val ) ) {
            strTpl = RegExp.$1;
            for ( var i = 0, length = data.length; i < length; i++ ) {
                o = data[ i ];
                ary.push( strTpl.replace( /###(\w+)###/, function( p, m ) {
                    return o[ m ] !== undefined ? o[ m ] : p;
                } ) );
            }
        }
        html = ary.join( '' );
        // 替换到填充位置
        var $des = document.getElementById( des );
        if ( $des ) {
            $des.innerHTML = html;
        }
        return html;
    };
    __.replaceAll = function( input, find, replace ) {
        return input.replace( RegExp( find.replace( /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&" ), 'g' ), replace );
    };
    // 版本号比较
    __.compareVersion = function( vera, verb ) {
        var ret = 0, va, vb;
        var veraAry = vera.split( '.' ), verbAry = verb.split( '.' ), maxLen = Math.max( veraAry.length, verbAry.length );
        for ( var i = 0; i < maxLen && !ret; i++ ) {
            va = +veraAry[ i ] || 0;
            vb = +verbAry[ i ] || 0;
            if ( va > vb ) {
                ret = 1;
            }
            if ( va < vb ) {
                ret = -1;
            }
        }
        return ret;
    };
    // 获得[lower, upper]范围内的整数
    __.random = function( lower, upper ) {
        var range = upper - lower + 1;
        return Math.floor( Math.random() * range + lower );
    };
    // 属性是否来自原型
    __.fromPrototype = function( obj, name ) {
        return !obj.hasOwnProperty( name ) && (name in obj);
    };
    // 日起相关
    __.date = {
        format : function( date, format ) {
            if ( !date ) { return; }
            var map = {
                'M+' : date.getMonth() + 1,
                'd+' : date.getDate(),
                'w+' : date.getDay(),
                'h+' : date.getHours(),
                'm+' : date.getMinutes(),
                's+' : date.getSeconds(),
                'S'  : date.getMilliseconds(),
                'q+' : Math.floor( (date.getMonth() + 3) / 3 )
            };
            var week = [ '周日', '周一', '周二', '周三', '周四', '周五', '周六' ];
            // 年
            if ( /(y+)/.test( format ) ) {
                format = format.replace( RegExp.$1, (date.getFullYear() + '').substr( 4 - RegExp.$1.length ) );
            }
            // 星期
            if ( /(w+)/.test( format ) ) {
                format = format.replace( RegExp.$1, week[ map[ 'w+' ] ] );
            }
            // 其它格式
            for ( var k in map ) {
                if ( new RegExp( '(' + k + ')' ).test( format ) ) {
                    format = format.replace( RegExp.$1, RegExp.$1.length == 1 ? map[ k ] : ('00' + map[ k ]).substr( ('' + map[ k ]).length ) );
                }
            }
            return format;
        }
    };
    // 检测是否支持CSS3属性
    // http://note.rpsh.net/posts/2011/05/20/css
    // http://ecd.tencent.com/css3/guide.html
    __.supportCss3 = function( style ) {
        var prefix = [ 'webkit', 'Moz', 'ms', 'o' ], htmlStyle = document.documentElement.style, aryHump = [], i;
        // 转换成驼峰写法
        function _toHump( str ) {
            return str.replace( /-(\w)/, function( $0, $1 ) {
                return $1.toUpperCase();
            } );
        }

        for ( i in prefix ) {
            aryHump.push( _toHump( prefix[ i ] + '-' + style ) );
        }
        aryHump.push( _toHump( style ) );
        for ( i in aryHump ) {
            if ( aryHump[ i ] in htmlStyle ) {
                return true;
            }
        }
        return false;
    };
    // 截字处理
    __.ellipsis = function( ele ) {
        var limitWidth = ele.clientWidth, ellipsisText = '...';
        var tmp = ele.cloneNode( true );
        ele.parentNode.appendChild( tmp );
        var realWidth = tmp.clientWidth;
        if ( realWidth <= limitWidth ) { return; }
        // 获取...的宽度
        tmp.innerHTML = ellipsisText;
        var elliWidth = tmp.clientWidth;
        // 多个连续空格处理
        var str = ele.innerHTML;
        str = str.replace( /\s+/g, ' ' );
        var s, width = 0;
        for ( var i = 0, len = str.length; i < len; i++ ) {
            s = str.charAt( i );
            tmp.innerHTML = (s === ' ' ? '&nbsp;' : s);
            width += tmp.clientWidth;
            if ( width + elliWidth > limitWidth ) {
                str = str.substr( 0, i );
                break;
            }
        }
        ele.innerHTML = str + ellipsisText;
        tmp.parentNode.removeChild( tmp );
    };
    // 获取浏览器滚动条宽高
    __.detectScrollbarWidthHeight = function() {
        var $div = document.createElement( 'div' );
        $div.id = '__detect__';
        $div.style.overflow = 'scroll';
        $div.style.visibility = 'hidden';
        $div.style.position = 'absolute';
        $div.style.width = '100px';
        $div.style.height = '100px';
        document.body.appendChild( $div );
        var hw = {
            width  : $div.offsetWidth - $div.clientWidth,
            height : $div.offsetHeight - $div.clientHeight
        };
        $div.parentNode.removeChild( $div );
        return hw;
    };
    // 获取页面滚动高度
    __.getScrollTop = function() {
        // 如果以声明DTD，则使用documentElement，但是Chrome是例外
        var doc = document, client = doc.compatMode == 'CSS1Compat' ? doc.documentElement : doc.body;
        return client.scrollTop;
    };
    // 获取页面可视高度，不包含滚动条
    __.getClientHeight = function() {
        // 如果以声明DTD，则使用documentElement，但是Chrome是例外
        var doc = document, client = doc.compatMode == 'CSS1Compat' ? doc.documentElement : doc.body;
        return client.clientHeight;
    };
    // 获取页面总体高估
    __.getScrollHeight = function() {
        // 如果以声明DTD，则使用documentElement，但是Chrome是例外
        var doc = document, client = doc.compatMode == 'CSS1Compat' ? doc.documentElement : doc.body;
        return Math.max( client.scrollHeight, client.clientHeight );
    };
    // 检测节点是否包含另一节点
    __.contains = function( pNode, cNode ) {
        if ( typeof pNode.contains == 'function' && (!__.browser.engine.webkit || __.browser.engine.webkit >= 522) ) {
            return pNode.contains( cNode );
        } else if ( typeof pNode.compareDocumentPosition == 'function' ) {
            return !!(pNode.compareDocumentPosition( cNode ) & 16);
        } else {
            var node = cNode.parentNode;
            do {
                if ( node == pNode ) {
                    return true;
                } else {
                    node = node.parentNode;
                }
            } while ( node !== null );
            return false;
        }
    };
    // 浏览器相关
    __.browser = function() {
        // 呈现引擎
        var engine = {
            ie     : 0,
            gecko  : 0,
            webkit : 0,
            khtml  : 0,
            opera  : 0,
            // 完整的版本号
            ver    : null
        };
        // 浏览器
        var browser = {
            ie      : 0,
            firefox : 0,
            safari  : 0,
            konq    : 0,
            opera   : 0,
            chrome  : 0,
            // 完整的版本号
            ver     : null
        };
        // 平台、设备和操作系统
        var system = {
            win       : false,
            mac       : false,
            x11       : false,
            // 移动设备
            iPhone    : false,
            iPod      : false,
            iPad      : false,
            iOS       : false,
            android   : false,
            nokiaN    : false,
            winMobile : false,
            // 游戏系统
            wii       : false,
            ps        : false
        };
        // 检测呈现引擎和浏览器
        var ua = navigator.userAgent;
        // opera
        if ( window.opera ) {
            engine.ver = browser.ver = window.opera.version();
            engine.opera = browser.opera = parseFloat( engine.ver );
        } else if ( /AppleWebkit\/(\S+)/.test( ua ) ) {
            engine.ver = RegExp.$1;
            engine.webkit = parseFloat( engine.ver );
            // 确定是Chrome还是Safari
            if ( /Chrome\/(\S+)/.test( ua ) ) {
                browser.ver = RegExp.$1;
                browser.chrome = parseFloat( browser.ver );
            } else if ( /Version\/(\S+)/.test( ua ) ) {
                // 此方式只适合Safari3及更高版本
                browser.ver = RegExp.$1;
                browser.safari = parseFloat( browser.ver );
            } else {
                // Safari低版本处理
                var safariVersion = 1;
                if ( engine.webkit < 100 ) {
                    safariVersion = 1;
                } else if ( engine.webkit < 312 ) {
                    safariVersion = 1.2;
                } else if ( engine.webkit < 412 ) {
                    safariVersion = 1.3;
                } else {
                    safariVersion = 2;
                }
                browser.safari = browser.ver = safariVersion;
            }
        } else if ( /KHTML\/(\S+)/.test( ua ) || /Konqueror\/([^;]+)/.test( ua ) ) {
            engine.ver = browser.ver = RegExp.$1;
            engine.khtml = browser.konq = parseFloat( engine.ver );
        } else if ( /rv:([^\)]+)\) Gecko\/\d{8}/.test( ua ) ) {
            engine.ver = RegExp.$1;
            engine.gecko = parseFloat( engine.ver );
            // 确定是不是Firefox
            if ( /Firefox\/(\S+)/.test( ua ) ) {
                browser.ver = RegExp.$1;
                browser.firefox = parseFloat( browser.ver );
            }
        } else if ( /MSIE ([^;]+)/.test( ua ) ) {
            engine.ver = browser.ver = RegExp.$1;
            engine.ie = browser.ie = parseFloat( engine.ver );
        }
        // 检测浏览器
        browser.ie = engine.ie;
        browser.opera = engine.opera;
        // 检测平台
        var p = navigator.platform;
        system.win = p.indexOf( 'Win' ) == 0;
        system.mac = p.indexOf( 'Mac' ) == 0;
        system.x11 = (p.indexOf( 'X11' ) == 0 || p.indexOf( 'Linux' ) == 0);
        // 检测Windows操作系统
        if ( system.win ) {
            if ( /Win(?:dows )?([^do]{2})\s?(\d+\.\d+)?/.test( ua ) ) {
                if ( RegExp.$1 == 'NT' ) {
                    switch ( RegExp.$2 ) {
                        case '5.0':
                            system.win = '2000';
                            break;
                        case '5.1':
                            system.win = 'XP';
                            break;
                        case '6.0':
                            system.win = 'Vista';
                            break;
                        case '6.1':
                            system.win = '7';
                            break;
                        default :
                            system.win = RegExp.$1;
                            break;
                    }
                } else if ( RegExp.$1 == '9x' ) {
                    system.win = 'ME';
                } else {
                    system.win = RegExp.$1;
                }
            }
        }
        // 移动设备
        system.iPhone = ua.indexOf( 'iPhone' ) > -1;
        system.iPod = ua.indexOf( 'iPod' ) > -1;
        system.iPad = ua.indexOf( 'iPad' ) > -1;
        // 检测iOS版本
        if ( system.mac && ua.indexOf( 'Mobile' ) > -1 ) {
            if ( /CPU (?:iPhone )?OS (\d+_\d+)/.test( ua ) ) {
                system.iOS = parseFloat( RegExp.$1.replace( '_', '.' ) );
            } else {
                system.iOS = 2;
            }
        }
        // 检测Android版本
        if ( /Android (\d+\.\d+)/.test( ua ) ) {
            system.android = parseFloat( RegExp.$1 );
        }
        system.nokiaN = ua.indexOf( 'NokiaN' ) > -1;
        // winPhone
        if ( system.win == 'CE' ) {
            system.winMobile = system.win;
        } else if ( system.win == 'Ph' ) {
            if ( /Windows Phone OS (\d+.\d+)/.test( ua ) ) {
                system.win = 'Phone';
                system.winMobile = parseFloat( RegExp.$1 );
            }
        }
        system.wii = ua.indexOf( 'Wii' ) > -1;
        system.ps = /playstation/i.test( ua );
        return {
            engine  : engine,
            browser : browser,
            system  : system
        };
    }();
    // 加载CSS
    __.loadStyles = function( url ) {
        var link = document.createElement( 'link' );
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url;
        var head = document.getElementsByTagName( 'head' )[ 0 ];
        head.appendChild( link );
    };
    __.loadScriptString = function( code ) {
        var script = document.createElement( 'script' );
        script.type = 'text/javascript';
        try {
            script.appendChild( document.createTextNode( code ) );
        } catch ( ex ) {
            script.text = code;
        }
        document.body.appendChild( script );
    };
    __.loadStyleString = function( css ) {
        var style = document.createElement( 'style' );
        style.type = 'text/css';
        try {
            style.appendChild( document.createTextNode( css ) );
        } catch ( ex ) {
            style.styleSheet.cssText = css;
        }
        var head = document.getElementsByTagName( 'head' )[ 0 ];
        head.appendChild( style );
    };
    // 获取选中的文本
    __.getSelectedText = function( textbox ) {
        if ( typeof textbox.selectionStart == 'number' ) {
            return textbox.value.substring( textbox.selectionStart, textbox.selectionEnd );
        } else if ( document.selection ) {
            return document.selection.createRange().text;
        }
    };
    // 设置文本选中
    __.selectText = function( textbox, start, end ) {
        if ( textbox.setSelectionRange ) {
            textbox.setSelectionRange( start, end );
        } else if ( textbox.createTextRange ) {
            var range = textbox.createTextRange();
            range.collapse( true );
            range.moveStart( 'character', start );
            range.moveEnd( 'character', end - start );
            range.select();
        }
        textbox.focus();
    };
    // cookie方法
    __.cookie = {
        get   : function( name ) {
            var cookieName = encodeURIComponent( name ), cookieStart = document.cookie.indexOf( cookieName ), cookieValue = null;
            if ( cookieStart > -1 ) {
                var cookieEnd = document.cookie.indexOf( ';', cookieStart );
                if ( cookieEnd == -1 ) {
                    cookieEnd = document.cookie.length;
                }
                cookieValue = decodeURIComponent( document.cookie.substring( cookieStart + cookieName.length + 1, cookieEnd ) )
            }
            return cookieValue;
        },
        set   : function( name, value, expires, domain, path, secure ) {
            var cookieText = encodeURIComponent( name ) + '=' + encodeURIComponent( value );
            if ( expires instanceof Date ) {
                cookieText += '; expires=' + expires.toGMTString();
            }
            if ( path ) {
                cookieText += '; path=' + path;
            }
            if ( domain ) {
                cookieText += '; domain=' + domain;
            }
            if ( secure ) {
                cookieText += '; secure';
            }
            document.cookie = cookieText;
        },
        unset : function( name, path, domain, secure ) {
            this.set( name, '', new Date( 0 ), path, domain, secure );
        }
    };
    // 本地存储方法
    function _storage() {
        var storageName = 'localStorage';
        var storage = {}, doc = window.document;
        // 检测是否支持localStorage
        function isSupported() {
            //return false;
            try {
                return storageName in win && win[ storageName ];
            } catch ( err ) {
                return false;
            }
        }

        if ( isSupported() ) {
            storage = win[ storageName ];
        } else if ( doc.documentElement.addBehavior ) {
            var $div = doc.createElement( 'div' );
            doc.body.appendChild( $div );
            $div.addBehavior( '#default#userData#' );
            storage.getItem = function( name ) {
                return window.JSON.parse( $div.getAttribute( name ) );
            };
            storage.setItem = function( name, value ) {
                if ( value === undefined ) {
                    return $div.removeItem();
                }
                $div.setAttribute( name, window.JSON.stringify( value ) );
                $div.save( storageName );
                return value;
            };
            storage.removeItem = function( name ) {
                $div.removeAttribute( name );
                $div.save( storageName );
            };
            storage.clear = function() {
                var attributes = storage.XMLDocument.documentElement.attributes;
                $div.load( storageName );
                for ( var i = 0, attr; attr = attributes[ i ]; i++ ) {
                    $div.removeAttribute( attr.name );
                }
                $div.save( storageName );
            };
        } else {
            storage.getItem = function( name ) {};
            storage.setItem = function( name, value ) {};
            storage.removeItem = function( name ) {};
            storage.clear = function() {};
        }
        return storage;
    }

    __.localStorage = new _storage();
    // 事件相关方法
    __.event = {
        add              : function( ele, type, handler ) {
            if ( ele.addEventListener ) {
                ele.addEventListener( type, handler, false );
            } else if ( ele.attachEvent ) {
                ele.attachEvent( 'on' + type, handler );
            } else {
                ele[ 'on' + type ] = handler;
            }
        },
        remove           : function( ele, type, handler ) {
            if ( ele.removeEventListener ) {
                ele.removeEventListener( type, handler, false );
            } else if ( ele.detachEvent ) {
                ele.detachEvent( 'on' + type, handler );
            } else {
                ele[ 'on' + type ] = null;
            }
        },
        getEvent         : function( event ) {
            return event ? event : window.event;
        },
        getTarget        : function( event ) {
            return event.target || event.srcElement;
        },
        getRelatedTarget : function( event ) {
            return event.relatedTarget || event.toElement || event.fromElement || null;
        },
        getButton        : function( event ) {
            if ( document.implementation.hasFeature( 'MouseEvents', '2.0' ) ) {
                return event.button;
            } else {
                switch ( event.button ) {
                    case 0:
                    case 1:
                    case 3:
                    case 5:
                    case 7:
                        return 0;
                    case 2:
                    case 6:
                        return 2;
                    case 4:
                        return 1;
                }
            }
        },
        getWheelDelta    : function( event ) {
            if ( event.wheelDelta ) {
                return (client.engine.opera && client.engine.opera < 9.5 ? -event.wheelDelta : event.wheelDelta);
            } else {
                return -event.detail * 40;
            }
        },
        getCharCode      : function( event ) {
            if ( typeof event.charCode == 'number' ) {
                return event.charCode;
            } else {
                return event.keyCode;
            }
        },
        getClipboardText : function( event ) {
            var clipboardData = (event.clipboardData || window.clipboardData);
            return clipboardData.getData( 'text' );
        },
        setClipboardText : function( event, value ) {
            if ( event.clipboardData ) {
                return event.clipboardData.setData( 'text/plain', value );
            } else if ( window.clipboardData ) {
                return window.clipboardData.setData( 'text', value );
            }
        },
        preventDefault   : function( event ) {
            if ( event.preventDefault ) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
        },
        stopPropagation  : function( event ) {
            if ( event.stopPropagation ) {
                event.stopPropagation();
            } else {
                event.cancelBubble = true;
            }
        }
    };
    // Ajax相关
    __.ajax = {
        createXHR             : function() {
            if ( typeof XMLHttpRequest != 'undefined' ) {
                return new XMLHttpRequest();
            } else if ( typeof ActiveXObject != 'undefined' ) {
                if ( typeof arguments.callee.activeXString != 'string' ) {
                    var versions = [ 'MSXML2.XMLHttp.6.0', 'MSXML2.XMLHttp.3.0', 'MSXML2.XMLHttp' ], i = 0, len = versions.length, xhr = null;
                    for ( ; i < len; i++ ) {
                        try {
                            xhr = new ActiveXObject( versions[ i ] );
                            arguments.callee.activeXString = versions[ i ];
                            break;
                        } catch ( err ) {}
                    }
                }
                return xhr;
            } else {
                throw new Error( 'no XHR object available.' );
            }
        },
        createCORSRequest     : function( method, url ) {
            var xhr = new XMLHttpRequest();
            if ( 'withCredentials' in xhr ) {
                xhr.open( method, url, true );
            } else if ( typeof XDomainRequest != 'undefined' ) {
                xhr = new XDomainRequest();
                xhr.open( method, url );
            } else {
                xhr = null;
            }
            return xhr;
        },
        imagePing             : function( url, onLoad, onError ) {
            var img = new Image();
            if ( onLoad && (typeof onLoad == 'function') ) {
                img.onload = onLoad;
            }
            if ( onError && (typeof onError == 'function') ) {
                img.onerror = onError;
            }
            img.src = url;
        },
        createStreamingClient : function( url, progress, finished ) {
            var xhr = new XMLHttpRequest(), recevied = 0;
            xhr.open( 'get', url, true );
            xhr.onreadystatechange = function() {
                var result;
                if ( xhr.readyState == 3 ) {
                    result = xhr.responseText.substring( recevied );
                    recevied = result.length;
                    progress( result );
                } else if ( xhr.readyState == 4 ) {
                    finished( xhr.responseText );
                }
            };
            xhr.send( null );
            return xhr;
        }
    };
    __.namespace = function( root, path, value ) {
        if ( !path ) { return root; }
        var ary = path.split( '.' ), k = '';
        while ( k = ary.shift() ) {
            if ( k ) {
                if ( typeof root[ k ] == 'undefined' ) {
                    root[ k ] = ary.length ? {} : value;
                } else {
                    if ( !ary.length ) {
                        throw new Error( '#############当前命名空间' + k + '已被占用鸟~#############' )
                    }
                }
                root = root[ k ];
            }
        }
    };
    window.__ = window.__ || __;
})();
//var obj = {};
//Object.defineProperty( obj, 'name', { writable : false, value : "John" } );