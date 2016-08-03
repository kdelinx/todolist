Ext.QuickTips.init();  // enable tooltips
Ext.Date.defaultFormat = 'd-m-Y';
Ext.Ajax.defaultHeaders = {
    'Content-Type': 'application/json'
};

Ext.onReady(function () {

    Ext.define('Note', {
        extend: 'Ext.data.Model',
        idProperty: 'id',
        fields: [{
            name: 'id',
            type: 'int'
        }, {
            name: 'title',
            type: 'string'
        }, {
            name: 'description',
            type: 'string'
        }, {
            name: 'date_created',
            type: 'date',
            dateFormat: 'd:m:Y',
            convert: function (v, record) {
                var date = new Date(v * 1000);
                return date.toISOString().slice(0, 10);
            }
        }, {
            name: 'is_fav',
            type: 'boolean'
        }, {
            name: 'ext_id',
            type: 'string'
        }],
        proxy: {
            type: 'ajax',
            api: {
                read: '/note/card/list/',
                create: '/note/card/create/',
                update: '/note/card/edit/',
                destroy: '/note/card/delete/'
            }
        }
    });

    var store = Ext.create('Ext.data.Store', {
        model: 'Note',
        autoLoad: true,
        pageSize: 20,
        groupField: 'is_fav',
        proxy: {
            type: 'ajax',
            url: '/note/card/list/',
            reader: {
                type: 'json',
                root: 'cards'
            }
        }
    });

    var form_edit = Ext.create('Ext.form.Panel', {
        items: [
            {
                xtype: 'textfield',
                fieldLabel: 'Название:',
                allowBlank: false,
                emptyText: 'введите название',
                minLength: 15,
                maxLength: 255,
                name: 'title'
            },
            {
                xtype: 'textarea',
                fieldLabel: 'Текст заметки:',
                allowBlank: false,
                flex: 1,
                emptyText: 'введите текст',
                minLength: 15,
                maxLength: 255,
                height: 180,
                name: 'description'
            }
        ],
        buttons: [
            {
                text: 'Заполнить поля',
                handler: function () {
                    var selected = panel.selModel.getSelection();
                    var noteData = {
                        id: selected[0].get('id'),
                        title: selected[0].get('title'),
                        description: selected[0].get('description'),
                        is_fav: selected[0].get('is_fav')
                    };
                    form_edit.getForm().setValues(noteData)
                }
            }, {
                text: 'Сохранить изменения',
                handler: function () {
                    var selected = panel.selModel.getSelection();
                    var uuid = selected[0].get('ext_id');
                    var values_change = form_edit.getForm().getValues();
                    values_change.ext_id = uuid;

                    Ext.Ajax.request({
                        method: 'POST',
                        url: '/note/card/edit/',
                        jsonData: values_change,
                        callback: function (options, success, response) {
                            if (success) {
                                Ext.MessageBox.alert(
                                    'Успешное изменение заметки' +
                                    response.statusText['status']
                                );
                            } else {
                                Ext.MessageBox.alert('Ошибка');
                            }
                        }
                    });
                }
            }
        ]
    });

    var panel = Ext.create('Ext.grid.Panel', {
        renderTo: Ext.getBody(),
        features: [Ext.create(
            'Ext.grid.feature.Grouping', {
                groupHeaderTpl: 'Группа  {name} ({rows.length})'
            })
        ],
        selType: 'rowmodel',
        width: '100%',
        padding: 10,
        title: 'Django notes',
        listeners: {
            itemcontextmenu: function (view, node, htmlItem, index, e, eOpts) {
                e.stopEvent();
                var editMenu = Ext.create('Ext.menu.Menu', {
                    items: [
                        {
                            text: 'Редактировать',
                            handler: function () {
                                panel.form_edit = Ext.create('Ext.window.Window', {
                                    title: 'Редактировать текущую заметку',
                                    width: 300,
                                    height: 300,
                                    layout: 'anchor',
                                    items: [form_edit]
                                });
                                panel.form_edit.show();
                            }
                        }, {
                            text: 'Отмена',
                            handler: function () {
                                this.destroy();
                            }
                        }
                    ]
                });
                editMenu.showAt(e.getXY());
            }
        },
        store: store,
        columns: [{
            header: 'ID',
            dataIndex: 'id',
            width: 40
        }, {
            header: 'Заголовок',
            dataIndex: 'title',
            width: 200
        }, {
            header: 'Описание',
            dataIndex: 'description',
            width: 600
        }, {
            header: 'Дата создания',
            dataIndex: 'date_created',
            xtype: 'datecolumn',
            width: 100,
            flex: 1
        }, {
            header: 'Избранная?',
            dataIndex: 'is_fav',
            xtype: 'booleancolumn',
            trueText: 'Да',
            falseText: 'Нет',
            flex: 1
        }, {
            header: 'Ссылка',
            xtype: 'actioncolumn',
            width: 80,
            items: [
                {
                    icon: 'assets/img/arrow.gif',
                    handler: function (grid, rowIndex, colIndex) {
                        var selectionModel = grid.getSelectionModel(), record;
                        selectionModel.select(rowIndex);
                        record = selectionModel.getSelection()[0];
                        window.open('/note/' + record.get('ext_id'), '_blank');
                    }
                }
            ]
        }, {
            header: 'Удалить',
            xtype: 'actioncolumn',
            width: 80,
            items: [
                {
                    icon: 'assets/img/del.png',
                    handler: function (grid, rowIndex, colIndex) {
                        var selectionModel = grid.getSelectionModel(), record;
                        selectionModel.select(rowIndex);
                        record = selectionModel.getSelection()[0];
                        store.removeAt(record);

                        Ext.Ajax.request({
                            method: 'POST',
                            url: '/note/card/delete/',
                            jsonData: {
                                id: record.get('id')
                            },
                            callback: function (options, success, response) {
                                if (success) {
                                    Ext.MessageBox.alert(
                                        'Успешное удаление заметки' +
                                        response.statusText['status']
                                    );
                                } else {
                                    Ext.MessageBox.alert('Ошибка');
                                }
                            }
                        });
                    }
                }
            ]
        }],
        dockedItems: [
            {
                xtype: 'toolbar',
                dock: 'bottom',
                items: [
                    {
                        xtype: 'button',
                        text: 'Добавить',
                        handler: function () {
                            windowAdd.show();
                        }
                    },
                    {
                        xtype: 'button',
                        text: 'Логин',
                        handler: function () {
                            windowLogin.show();
                        }
                    }, {
                        xtype: 'button',
                        text: 'Регистрация',
                        handler: function () {
                            windowRegister.show();
                        }
                    }, '->', 'Dev by kdelinx']
            },
            {
                xtype: 'pagingtoolbar',
                store: store,
                dock: 'bottom',
                displayInfo: true,
                beforePageText: 'Страница',
                afterPageText: 'из {0}',
                displayMsg: 'Заметки {0} - {1} из {2}'
            },
            {
                xtype: 'toolbar',
                dock: 'top',
                items: ['->', 'Поиск', {
                    xtype: 'textfield',
                    enableKeyEvents: true,
                    listeners: {
                        keyup: function (string) {
                            store.clearFilter();
                            var dataToDelete = [];
                            store.each(function (rec, idx) {
                                contains = false;
                                for (field in rec.data) {
                                    if (field == 'title' && field == 'description') {
                                        if (rec.data in string.getValue()) {
                                            contains = true;
                                        } else {
                                            contains = false;
                                        }
                                    }
                                }
                                if (!contains) {
                                    rec.filterMeOut = false;
                                } else {
                                    rec.filterMeOut = true;
                                }
                            });

                            //custom filter object
                            store.filterBy(function (rec, id) {
                                if (rec.filterMeOut) {
                                    return true;
                                }
                                else {
                                    return false;
                                }
                            });
                        }
                    }
                }]
            }
        ]
    });

    var windowAdd = Ext.create('Ext.window.Window', {
        title: 'Добавить новую заметку',
        width: 300,
        height: 300,
        layout: 'anchor',
        items: [Ext.create('Ext.form.Panel',
            {
                items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Название:',
                        allowBlank: false,
                        emptyText: 'введите название',
                        minLength: 15,
                        maxLength: 255,
                        name: 'title'
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Текст заметки:',
                        allowBlank: false,
                        emptyText: 'введите текст',
                        minLength: 15,
                        maxLength: 255,
                        name: 'desc'
                    },
                    {
                        xtype: 'button',
                        allowBlank: false,
                        text: 'Выбор категории',
                        enableToggle: true,
                        name: 'type',
                        margin: '0 0 0 105',
                        menu: [
                            {text: 'Ссылка', name: 'id-1', value: 0},
                            {text: 'Карточка', name: 'id-2', value: 1},
                            {text: 'Заметка', name: 'id-3', value: 2},
                            {text: 'Уведомление', name: 'id-4', value: 3}
                        ]
                    }
                ]
            })
        ],
        fbar: ['->', {
            xtype: 'button',
            text: 'Создать',
            handler: function () {
                var cart_new_obj = windowAdd.items.get(0);
                Ext.Ajax.request({
                    method: 'POST',
                    url: '/note/card/create/',
                    jsonData: {
                        title: cart_new_obj.items.items[0].value,
                        desc: cart_new_obj.items.items[1].value,
                        type: cart_new_obj.items.items[2].menu.items.items[2].value
                    },
                    callback: function (options, success, response) {
                        if (success) {
                            Ext.MessageBox.alert(
                                'Успешное добавление заметки со статусом ' +
                                response.statusText['status']
                            );
                            store.refresh();
                            windowRegister.hide();
                        } else {
                            Ext.MessageBox.alert('Ошибка');
                        }
                    }
                });
            }
        }, {
            xtype: 'button',
            text: 'Отмена',
            handler: function () {
                windowAdd.hide();
            }
        }]
    });

    var windowRegister = Ext.create('Ext.window.Window', {
        title: 'Регистрация пользователя',
        width: 300,
        height: 300,
        layout: 'anchor',
        items: [Ext.create('Ext.form.Panel',
            {
                items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Email:',
                        allowBlank: false,
                        emptyText: 'введите email',
                        minLength: 15,
                        maxLength: 255,
                        name: 'email'
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Фамилия:',
                        allowBlank: false,
                        emptyText: 'введите фамилию',
                        minLength: 2,
                        maxLength: 255,
                        name: 'first_name'
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Имя:',
                        allowBlank: false,
                        emptyText: 'введите имя',
                        minLength: 2,
                        maxLength: 255,
                        name: 'last_name'
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Пароль:',
                        allowBlank: false,
                        emptyText: 'введите пароль',
                        inputType: 'password',
                        minLength: 8,
                        maxLength: 255,
                        name: 'password'
                    }
                ]
            })
        ],
        fbar: ['->', {
            xtype: 'button',
            text: 'Отмена',
            handler: function () {
                windowRegister.hide();
            }
        },
            {
                xtype: 'button',
                text: 'Регистрация',
                handler: function () {
                    var form_obj = windowRegister.items.get(0);
                    Ext.Ajax.request({
                        method: 'POST',
                        url: '/users/user/register/',
                        jsonData: {
                            email: form_obj.items.items[0].value,
                            first_name: form_obj.items.items[1].value,
                            last_name: form_obj.items.items[2].value,
                            password: form_obj.items.items[3].value
                        },
                        callback: function (options, success, response) {
                            if (success) {
                                Ext.MessageBox.alert(
                                    'Успешная регистрация со статусом ' +
                                    response.statusText['status']
                                );
                                windowRegister.hide();
                            } else {
                                Ext.MessageBox.alert('Ошибка');
                            }
                        }
                    });
                }
            }]
    });

    var windowLogin = Ext.create('Ext.window.Window', {
        title: 'Авторизация пользователя',
        width: 300,
        height: 300,
        layout: 'anchor',
        items: [Ext.create('Ext.form.Panel',
            {
                items: [
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Email:',
                        allowBlank: false,
                        emptyText: 'введите email',
                        minLength: 15,
                        maxLength: 255,
                        name: 'email'
                    },
                    {
                        xtype: 'textfield',
                        fieldLabel: 'Пароль:',
                        allowBlank: false,
                        emptyText: 'введите пароль',
                        inputType: 'password',
                        minLength: 8,
                        maxLength: 255,
                        name: 'password'
                    }
                ]
            })
        ],
        fbar: ['->', {
            xtype: 'button',
            text: 'Отмена',
            handler: function () {
                windowRegister.hide();
            }
        },
            {
                xtype: 'button',
                text: 'Логин',
                handler: function () {
                    var form_obj = windowLogin.items.get(0);
                    Ext.Ajax.request({
                        method: 'POST',
                        url: '/users/user/login/',
                        jsonData: {
                            email: form_obj.items.items[0].value,
                            password: form_obj.items.items[1].value
                        },
                        callback: function (options, success, response) {
                            if (success) {
                                Ext.MessageBox.alert(
                                    'Успешная  авторизация со статусом ' +
                                    response.statusText['status']
                                );
                                windowRegister.hide();
                            } else {
                                Ext.MessageBox.alert('Ошибка');
                            }
                        }
                    });
                }
            }]
    });
});