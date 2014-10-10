(function() {
    var util = {};
    // url解析相关
    util.url = {
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
    util.tmpl = function( data, tpl, des ) {
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
    // 版本号比较
    util.compareVersion = function( vera, verb ) {
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
    util.random = function( lower, upper ) {
        var range = upper - lower + 1;
        return Math.floor( Math.random() * range + lower );
    };
    // 属性是否来自原型
    util.fromPrototype = function( obj, name ) {
        return !obj.hasOwnProperty( name ) && (name in obj);
    };
    // 日起相关
    util.date = {
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
    util.supportCss3 = function( style ) {
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
    util.ellipsis = function( ele ) {
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
    // cookie方法
    util.cookie = {
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

    util.localStorage = new _storage();
    // 事件相关方法
    util.event = {
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
    util.ajax = {
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
    window.util = util;
})();
//var obj = {};
//Object.defineProperty( obj, 'name', { writable : false, value : "John" } );