'use strict';
describe('QpenViewActionBuilder', function () {
    describe('build', function () {
        it('successful build', function () {
            var metadata = {

                OpenViewAction: {
                    View: {
                        ExistsView: {

                        }
                    }
                }
            };
            var builder = new ApplicationBuilder();
            var a = builder.build(null, metadata);

            assert.isNotNull(a);
            assert.isNotNull( a.execute);
        });
    });

});
describe('PrintReportAction', function () {
    it('should be render', function () {
        var view = new View();
        var metadata = {
            Button: {
                Action: {
                    PrintReportAction: {
                        Configuration: "EmergencyRoom",
                        Template: "MedicalHistoryReport",
                        Parameters: [
                            {
                                Name: "HospitalizationId",
                                Value: "4427715e-1f73-4077-a58b-9be70c502287"
                            }
                        ],
                        FileFormat: 0
                    }
                }
            }
        };
        var printBuilder = new ApplicationBuilder();
        var el = printBuilder.build(view, metadata);
        var action = el.getAction();

        assert.isNotNull(el);
        assert.isNotNull(el.execute);
        assert.equal('BaseAction', action.constructor.name);
    });
});
describe('Builder', function () {
    var builder;

    beforeEach(function () {
        builder = new Builder();
    });

    describe('build', function () {
        it('should return null if no builder found', function () {
            var view = builder.buildType(fakeView(), 'TextBox', null);

            assert.isNull(view);
        });

        it('should find builder by metadataValue if no metadataType passed', function () {
            var viewFactory = function () {
                return 42;
            };

            builder.register('TextBox', { build: viewFactory});
            assert.equal(builder.build(null, { TextBox: {} }), 42);
        });

        it('should pick concrete value from metadata if no metadataType passed', function () {
            var viewBuilder = {
                build: function (b, p, metadata) {
                    assert.isNotNull(metadata.Name);
                    assert.isNotNull(metadata.Multiline);

                    assert.equal(metadata.Name, 'TextBox');
                    assert.isTrue(metadata.Multiline);
                }
            };

            builder.register('TextBox', viewBuilder);
            builder.build(null, { TextBox: { Name: 'TextBox', Multiline: true } });
        });
    });

    describe('register', function () {
        it('should have builder after register', function () {
            var viewFactory = function () {
                return 42;
            };
            builder.register('TextBox', { build: viewFactory});

            assert.equal(builder.buildType(fakeView(), 'TextBox', null), 42);
        });
    });
});
describe('ButtonControl', function () {
    describe('render', function () {
        it('should render button with correct class', function () {
            //Given
            var button = new ButtonControl();
            button.set('text','Click me!');

            //When
            var $el = button.render().children();

            //Then
            assert.isTrue($el.hasClass('btn'));
            assert.equal($.trim($el.text()), 'Click me!');
        });
    });
});
/*describe('DataGrid', function () {
    describe('render', function () {

        it('Setting the properties: value, name, enabled, visible, horizontalAlignment', function () {
            // Given
            var grid = new DataGrid(),$el, $control;

            $el = grid.render();
            $control = $el.find('table');

            assert.lengthOf($control, 1);
            assert.isUndefined($el.attr('data-pl-name'));
            assert.isFalse($el.hasClass('pull-left'));
            assert.isFalse($el.hasClass('pull-right'));
            assert.isFalse($el.hasClass('center-block'));

            // When
            grid.setHorizontalAlignment('Right');

            //Then
            assert.isTrue($el.hasClass('pull-right'));
        });

        it('Setting Columns', function () {
            // Given
            var metadata = {
                "Name": "DataGrid1",
                "Columns": [
                    {
                        "Name": "Column1",
                        "Text": "Фамилия",
                        "DisplayProperty": "LastName"
                    },
                    {
                        "Name": "Column2",
                        "Text": "Имя",
                        "DisplayProperty": "FirstName"
                    },
                    {
                        "Name": "Column3",
                        "Text": "Отчество",
                        "DisplayProperty": "MiddleName",
                        "Visible": false
                    }
                ]
            };
            var builder = new DataGridBuilder();
            var grid = builder.build(new ApplicationBuilder(), null, metadata);

            var el = grid.render();
            var th = el.find('th');

            assert.lengthOf(th, 3);
            assert.equal(th[0].innerText, 'Фамилия');
            assert.equal(th[1].innerText, 'Имя');
            assert.equal(th[2].innerText, 'Отчество');

            assert.notEqual(th[0].style.display.toLowerCase(), 'none');
            assert.notEqual(th[1].style.display.toLowerCase(), 'none');
            assert.isTrue(th[2].classList.contains('hidden'));


            //When
            grid.getColumns()[2].setVisible(true);
            grid.getColumns()[1].setText('Name');

            //Then
            assert.equal(th[0].innerText, 'Фамилия');
            assert.equal(th[1].innerText, 'Name');
            assert.equal(th[2].innerText, 'Отчество');
            assert.notEqual(th[0].style.display.toLowerCase(), 'none');
            assert.notEqual(th[1].style.display.toLowerCase(), 'none');
            assert.notEqual(th[2].style.display.toLowerCase(), 'none');

        });

    });


    describe('DataGrid data binding', function () {
        it('should set DataGrid.items from property binding', function () {
            //Given
            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });


            var metadata = {
                Text: 'Пациенты',
                DataSources: [
                    {
                        DocumentDataSource: {
                            Name : "PatientDataSource",
                            ConfigId: 'Demography',
                            DocumentId: 'Patient',
                            IdProperty: 'Id',
                            CreateAction: 'CreateDocument',
                            GetAction: 'GetDocument',
                            UpdateAction: 'SetDocument',
                            DeleteAction: 'DeleteDocument',
                            FillCreatedItem: true
                        }
                    }
                ],
                LayoutPanel: {
                    StackPanel: {
                        Name: 'MainViewPanel',
                        Items: [
                            {
                                DataGrid: {
                                    "Name": "DataGrid1",
                                    "Columns": [
                                        {
                                            "Name": "Column1",
                                            "Text": "Фамилия",
                                            "DisplayProperty": "LastName"
                                        },
                                        {
                                            "Name": "Column2",
                                            "Text": "Имя",
                                            "DisplayProperty": "FirstName"
                                        },
                                        {
                                            "Name": "Column3",
                                            "Text": "Отчество",
                                            "DisplayProperty": "MiddleName",
                                            "Visible": false
                                        }
                                    ],
                                    "Items": {
                                        "PropertyBinding": {
                                            "DataSource": "PatientsDataSource"
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            };

            var $target = $('<div>');

            var linkView = new LinkView(null, function (resultCallback) {
                var builder = new ApplicationBuilder();
                var view = builder.buildType(fakeView(), 'View', metadata);
                resultCallback(view);
            });
            linkView.setOpenMode('Application');

            linkView.createView(function(view){
                view.open();

                var itemToSelect = null,
                    dataSource = view.getDataSource('PatientDataSource');

                assert.isNotNull($target.find('table'));

                dataSource.getItems(function(data){
                    assert.notEqual($target.find('table>tbody').html(), '');
                });

            });
        });
    });

});*/
/*describe('DataGridBuilder', function () {
    describe('build', function () {
        it('successful build', function () {
            // Given

            var metadata = {
                "Name": "DataGrid1",
                "Columns": [
                    {
                        "Name": "Column1",
                        "Text": "Фамилия",
                        "DisplayProperty": "LastName"
                    },
                    {
                        "Name": "Column2",
                        "Text": "Имя",
                        "DisplayProperty": "FirstName"
                    },
                    {
                        "Name": "Column3",
                        "Text": "Отчество",
                        "DisplayProperty": "MiddleName",
                        "Visible": false
                    }
                ]
            };

            // When
            var builder = new DataGridBuilder();
            var grid = builder.build(new ApplicationBuilder(), null, metadata);
            grid.render();

            // Then
            assert.isNotNull(grid);
            assert.lengthOf(grid.getColumns(), 3);
            assert.equal(grid.getName(), 'DataGrid1');
            assert.isTrue(grid.getColumns()[0].getVisible());
            assert.isTrue(grid.getColumns()[1].getVisible());
            assert.isFalse(grid.getColumns()[2].getVisible());
            assert.equal(grid.getColumns()[0].getName(), 'Column1');
            assert.equal(grid.getColumns()[1].getName(), 'Column2');
            assert.equal(grid.getColumns()[2].getName(), 'Column3');
            assert.equal(grid.getColumns()[0].getText(), 'Фамилия');
            assert.equal(grid.getColumns()[1].getText(), 'Имя');
            assert.equal(grid.getColumns()[2].getText(), 'Отчество');

        });
    });
});*/
describe('DatePickerControl', function () {
    describe('render', function () {
        it('should update date when change value', function () {
            //Given
            var datePicker = new DatePickerControl();
            var oldDate = new Date(2012, 10, 2);
            var newDate = new Date(2014, 7, 28);
            var $el = datePicker.render().find('.date .datePicker');

            datePicker.set('value', oldDate);

            //When
            datePicker.set('value', newDate);

            //Then
            assert.equal($el.val(), '28.08.2014');
        });

        it('should update value when change date', function () {
            //Given
            var datePicker = new DatePickerControl();
            var oldDate = new Date(2012, 10, 2);
            var newDate = '28.08.2014';

            datePicker.set('value', oldDate);

            var $el = datePicker.render().find('.date .datePicker');

            //When
            $el
                .val(newDate)
            .parent().data('datepicker')
                .update();

            //Then
            assert.equal(datePicker.get('value').substr(0, 10), '2014-08-28');
        });

        it('should clear date when value is null', function () {
            //Given
            var datePicker = new DatePickerControl();
            var value = new Date(2012, 10, 2);

            datePicker.set('value', value);
            assert.equal( datePicker.get('value').substr(0, 10), '2012-11-02');

            var $el = datePicker.render().find('.date');

            //When
            datePicker.set('value', null);

            //Then
            assert.isNull( datePicker.get('value') );
        });

        it('should set minDate and maxDate', function () {
            //Given
            var datePicker = new DatePickerControl();
            var minDate = new Date(2010, 0, 1);
            var maxDate = new Date(2014, 11, 31);

            datePicker.set('minDate', minDate);
            datePicker.set('maxDate', maxDate);

            //When
            var $el = datePicker.render().find('.date');
            var pluginObject = $el.data('datepicker');

            //Then
            var startDate = pluginObject._utc_to_local( pluginObject.o.startDate );
            var endDate = pluginObject._utc_to_local( pluginObject.o.endDate);

            assert.ok( startDate.getTime() ==  minDate.getTime(), "MinDate: установленное значение (" + startDate + ") не равно ожидаемому (" + minDate + ")");
            assert.ok( endDate.getTime() == maxDate.getTime(), "MaxDate: установленное значение (" + endDate + ") не равно ожидаемому (" + maxDate + ")");
        });

        it('do not change value if it is not between minDate and maxDate', function () {
            //Given
            var datePicker = new DatePickerControl();
            var minDate = new Date(2010, 0, 1);
            var maxDate = new Date(2014, 11, 31);

            var correctDate = new Date(2012, 10, 2);

            var lessThanMinDate = new Date(minDate);
            lessThanMinDate.setDate(minDate.getDate() - 1);

            var moreThanMaxDate = new Date(maxDate);
            moreThanMaxDate.setDate(maxDate.getDate() + 1);

            datePicker.set('minDate', minDate);
            datePicker.set('maxDate', maxDate);
            var $el = datePicker.render().find('.date');

            //When
            datePicker.set('value', correctDate);
            //поскольку lessThanMinDate и moreThanMaxDate не входят в допустимый диапазон, ожидается, что дата не измениться
            datePicker.set('value', lessThanMinDate);
            datePicker.set('value', moreThanMaxDate);

            //Then
            var dateInPicker = InfinniUI.DateUtils.toISO8601( $el.datepicker('getDate')).substr(0, 10),
                settedDate = '2012-11-02';
            assert.ok(dateInPicker == settedDate, "Установленное значение (" + settedDate + ") не равно ожидаемому (" + dateInPicker + ")");
        });

        it('should set Enabled', function () {
            //Given
            var datePicker = new DatePickerControl();
            datePicker.set('enabled', false);

            var $el = datePicker.render().find('.date');

            $.each($el.children('.form-control, button'), function(index, child){
                assert.isTrue(child.hasAttribute('disabled'));
            });

            //When
            datePicker.set('enabled', true);

            //Then
            $.each($el.children('.form-control, button'), function(index, child){
                assert.isFalse(child.hasAttribute('disabled'));
            });
        });

        it('should set Time mode', function () {
            //Given
            var datePicker = new DatePickerControl();
            datePicker.set('mode', 'Time');

            var $control = datePicker.render().find('.timepicker-control');

            //When
            datePicker.set('value', new Date("21 May 1958 10:12"));

            //Then
            assert.equal($control.val(), '10:12');
        });

        it('should set Time mode 2', function () {
            //Given
            var datePicker = new DatePickerControl(),
                value;

            datePicker.set('mode', 'Time');


            var $control = datePicker.render().find('.timepicker-control');

            //When
            $control.timepicker('setTime', '12:45');

            //Then
            value = new Date(datePicker.get('value'));
            assert.equal(value.getHours() + ':' + value.getMinutes(), '12:45');
        });

        it('should set DateTime mode', function () {
            //Given
            var datePicker = new DatePickerControl(),
                date = new Date(0);
            datePicker.set('mode', 'DateTime');

            var $control = datePicker.render().find('.form-control');

            //When
            datePicker.set('value', date);

            //Then
            assert.equal($control.val().substr(0, 10), '01.01.1970');
        });

        it('should set DateTime mode 2', function () {
            //Given
            var datePicker = new DatePickerControl(),
                value,
                date = new Date(0);

            datePicker.set('mode', 'DateTime');

            var $r = datePicker.render(),
                $control = $r.find('.form_datetime');

            //When
            $control.data('datetimepicker')._setDate(date);

            //Then
            assert.equal(datePicker.get('value').substr(0, 10), InfinniUI.DateUtils.toISO8601(date).substr(0, 10));
        });
    });
});
describe('GridPanelControl', function () {
    describe('render', function () {
        it('should render rows and cells', function () {
            //Given
            var grid = new GridPanelControl(),
                rows = [
                    new GridRow(),
                    new GridRow()
                ],
                cells = [],
                items = [
                    new TextBox()
                ];

            grid.addRow(rows[0]);
            grid.addRow(rows[1]);

            cells.push( rows[0].addCell(12) );
            cells.push( rows[1].addCell(6) );
            cells.push( rows[1].addCell(6) );

            cells[0].addItem(items[0]);

            //When
            var $el = grid.render();

            //Then
            assert.equal($el.find('.pl-grid-row').length, 2);

            assert.equal($el.find('.pl-grid-row:first .pl-grid-cell').length, 1);
            assert.equal($el.find('.pl-grid-row:last .pl-grid-cell').length, 2);

            assert.isTrue($el.find('.pl-grid-row:first .pl-grid-cell:first').hasClass('col-md-12'));
            assert.isTrue($el.find('.pl-grid-row:last .pl-grid-cell:first').hasClass('col-md-6'));

            assert.equal($el.find('.pl-grid-row:first .pl-grid-cell:first input.pl-text-box-input').length, 1);
        });

        it('should have Stretch alignment by default', function () {
            //Given
            var grid = new GridPanelControl();

            //When
            var $el = grid.render();

            //Then
            assert.isFalse($el.hasClass('pull-left'));
            assert.isFalse($el.hasClass('pull-right'));
            assert.isFalse($el.hasClass('center-block'));
        });
    });
});
describe('Label', function () {
    var label;

    beforeEach(function () {
        label = new Label();
    });

    describe('Render', function () {

        describe('Setting the properties', function () {

            it('Setting property: name', function () {
                //Given
                var $el = label.render();
                assert.isUndefined($el.attr('pl-data-pl-name'));

                //When
                label.setName('NewLabel');

                //Then
                assert.equal($el.attr('data-pl-name'), 'NewLabel');
            });

            it('Setting property: visible', function () {
                //Given
                var $el = label.render();
                assert.isFalse($el.hasClass('hidden'));

                //When
                label.setVisible(false);

                //Then
                assert.isTrue($el.hasClass('hidden'));
            });

            it('Setting property: horizontalAlignment', function () {
                //Given
                var $el = label.render();
                assert.isTrue($el.hasClass('horizontalTextAlignment-Left'));
                assert.isFalse($el.hasClass('horizontalTextAlignment-Right'));
                assert.isFalse($el.hasClass('horizontalTextAlignment-Center'));
                assert.isFalse($el.hasClass('horizontalTextAlignment-Justify'));

                //When
                label.setHorizontalTextAlignment('Right');

                //Then
                assert.isTrue($el.hasClass('horizontalTextAlignment-Right'));
                assert.isFalse($el.hasClass('horizontalTextAlignment-Left'));
                assert.isFalse($el.hasClass('horizontalTextAlignment-Center'));
                assert.isFalse($el.hasClass('horizontalTextAlignment-Justify'));
            });

            it('Setting property: text', function () {
                //Given
                label.setText('Default Label');

                var $el = label.render(),
                    $label = $('label', $el);

                assert.equal($label.html(), 'Default Label');

                //When
                label.setText('New Label');

                //Then
                assert.equal($label.html(), 'New Label');
            });
        });

    });

    describe('Data binding', function () {
        it('should set Label from property binding', function () {

            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            //$('body').append($('<div>').attr('id', 'page-content'));

            var metadata = {
                Text: 'Пациенты',
                DataSources: [
                    {
                        DocumentDataSource: {
                            Name : "PatientDataSource",
                            ConfigId: 'Demography',
                            DocumentId: 'Patient',
                            IdProperty: 'Id',
                            CreateAction: 'CreateDocument',
                            GetAction: 'GetDocument',
                            UpdateAction: 'SetDocument',
                            DeleteAction: 'DeleteDocument',
                            FillCreatedItem: true
                        }
                    }
                ],
                LayoutPanel: {
                    StackPanel: {
                        Name: 'MainViewPanel',
                        Items: [
                            {
                                Label: {
                                    Name: 'Label1',
                                    Value : {
                                        PropertyBinding : {
                                            DataSource : 'PatientDataSource',
                                            Property : '$.LastName'
                                        }
                                    },
                                    Text: 'Text Label'
                                }
                            }
                        ]
                    }
                }
            };

            var linkView = new LinkView(null, function (resultCallback) {
                var builder = new ApplicationBuilder();
                var view = builder.buildType(fakeView(), 'View', metadata);
                resultCallback(view);
            });
            linkView.setOpenMode('Application');

            var view = linkView.createView(function(view){
                view.open();

                var itemToSelect = null;

                view.getDataSource('PatientDataSource').getItems(
                    function(data){
                        itemToSelect = data[0];
                        view.getDataSource('PatientDataSource').setSelectedItem(itemToSelect);
//                        console.log(itemToSelect);
//                        console.log($('#page-content').find('label').html());
                        assert.equal($('#sandbox').find('label').html(), itemToSelect.LastName);

                        //$('#page-content').remove();
                    }
                );
            });
        });
    });
});

describe('PanelControl', function () {
    describe('render', function () {
        it('should render header and content items', function () {
            //Given
            var panel = new PanelControl();
            panel.setText('Test');
            panel.addItem(new TextBox().control);
            panel.addItem(new TextBox().control);

            //When
            var $el = panel.render();

            //Then
            assert.equal($el.find('.portlet-title').length, 1);
            assert.equal($el.find('.portlet-title .caption').html(), 'Test');

            assert.equal($el.find('.portlet-body').length, 1);
            assert.equal($el.find('.portlet-body input.pl-text-box-input').length, 2);
        });
    });
});
describe('TreeView', function () {
    describe('build', function () {

        it('Build tree', function () {
            // Given
            var metadata = {
                "KeyProperty": "Id",
                "ParentProperty": "ParentId",
                "ItemFormat": {
                    "ObjectFormat": {
                        "Format": "{Id:n3}_{DisplayName}"
                    }
                },
                "ValueProperty": "CardNumber",
                "ReadOnly": false,
                "MultiSelect": true
            };
            var builder = new TreeViewBuilder();
            var tree = builder.build(new ApplicationBuilder(), null, metadata);
            tree.render();

            //When
            var items = [{id:1, text: 2}, {id: 3, text:4}, {id:5, text: 6}];
            var value = [{Id: 1}, {Id: 5}];
            tree.setItems(items);
            tree.setValue(value);

            //Then
            assert.deepEqual(tree.getItems(), items);
            assert.deepEqual(tree.getValue(), value);
        });

    });

});
describe('Parameters', function () {

    /*it('should get/set value from datasource', function () {

        var provider = new FakeDataProvider();

        window.providerRegister.register('DocumentDataSource', function () {
            return provider;
        });

        var builder = new ApplicationBuilder();

        var view = fakeView();

        var metadata = {
            Name: 'PatientDataSource',
            ConfigId: 'Demography',
            DocumentId: 'Patient',
            IdProperty: 'Id',
            CreateAction: 'CreateDocument',
            GetAction: 'GetDocument',
            UpdateAction: 'SetDocument',
            DeleteAction: 'DeleteDocument',
            FillCreatedItem: true
        };


        var items = null;
        provider.getItems(null, 0, 10, null,  function (data) {
            items = data;
        });

        var dataSource = builder.buildType(view, 'DocumentDataSource', metadata);

        var dataBinding = new PropertyBinding(view, dataSource.getName(), '$.LastName');

        view.parameters = [];

        view.addParameter = function (parameter) {view.parameters.push(parameter);};
        view.getParameter = function () {return view.parameters[0];};
        view.getDataSource = function () {return dataSource;};

        var parameter = builder.buildType(view, 'Parameter', {
            Name: 'Patient',
            Value: {
                PropertyBinding: {
                    DataSource: 'PatientDataSource',
                    Property: '$'
                }
            }
        });

        var parameterBinding = builder.buildType(view, 'ParameterBinding', {
            Parameter: "Patient",
            Property: "LastName"
        });

        parameter.addDataBinding(parameterBinding);


        //dataSource.setEditMode();
        dataSource.resumeUpdate();
        dataSource.setSelectedItem(items[0]);
        parameter.addDataBinding(dataBinding);


        assert.isTrue(_.isEqual(items[0], parameter.getValue()));
        assert.equal(items[0].LastName, parameterBinding.getPropertyValue());
        parameterBinding.setPropertyValue('2014');
        assert.equal('2014', parameter.getValue().LastName);
    });*/

});
describe('PropertyBinding', function () {

    var dataSource = {
        Name: 'PatientDataSource',
        ConfigId: 'Demography',
        DocumentId: 'Patient',
        IdProperty: 'Id'
    };

    var property = 'LastName',
        view = fakeView({
            getDataSource: function (value) {
                for (var i = 0; i < dataSources.length; i++) {
                    if (dataSources[i].getName() == value) {
                        return dataSources[i];
                    }
                }
                return null;
            }
        }),
        builder = new ApplicationBuilder(),
        dataSourceBuilder = new DocumentDataSourceBuilder(),
        dataSourcePatient = dataSourceBuilder.build(builder, view, {
            Name: 'PatientDataSource',
            ConfigId: 'Demography',
            DocumentId: 'Patient',
            IdProperty: 'Id'
        }),
        dataSourceMedicalWorker = dataSourceBuilder.build(builder, view, {
            Name: 'MedicalWorkerDataSource',
            ConfigId: 'Structure',
            DocumentId: 'MedicalWorker',
            IdProperty: 'Id'
        }),
        dataSources = [dataSourcePatient, dataSourceMedicalWorker];

    it('should build property binding', function () {

        var propertyBinding = {
            Name: "PatientBinding",
            DataSource: 'PatientDataSource',
            Property: 'LastName'
        };

        var dataSources = [dataSourcePatient, dataSourceMedicalWorker];

        var propertyBindingBuilder = new PropertyBindingBuilder();

        propertyBindingBuilder.build(builder, view, propertyBinding);

        assert.equal(dataSources[0].getDataBindings().length, 1);
        //check that dataSource binding was added
        assert.equal(dataSources[0].getDataBindings()[0].getDataSource(), dataSources[0].getName());
    });


    it('should get baseDataBinding properties', function () {
        var dataBinding = new PropertyBinding(view, dataSource, property);

        assert.equal(dataBinding.getProperty(), property);
        assert.equal(dataBinding.getDataSource(), dataSource);
        assert.equal(dataBinding.getView(), view);

    });

});
describe('DocumentDataSource', function () {
    var builder = new ApplicationBuilder(),
        metadata = {
            Name: 'PatientDataSource',
            ConfigId: 'Demography',
            DocumentId: 'Patient',
            IdProperty: 'Id',
            CreateAction: 'CreateDocument',
            GetAction: 'GetDocument',
            UpdateAction: 'SetDocument',
            DeleteAction: 'DeleteDocument',
            FillCreatedItem: true
            //PageNumber: 10,
            //PageSize: 50
        },
        parentView = fakeView();

    describe('build DocumentDataSource', function () {
        it('should build documentDataSource', function () {
            var createdDataSource = builder.buildType(fakeView(), 'DocumentDataSource', metadata);
            assert.equal(createdDataSource.getConfigId(), 'Demography');
            assert.equal(createdDataSource.getDocumentId(), 'Patient');
            assert.equal(createdDataSource.getIdProperty(), 'Id');
            assert.equal(createdDataSource.getCreateAction(), 'CreateDocument');
            assert.equal(createdDataSource.getGetAction(), 'GetDocument');
            assert.equal(createdDataSource.getUpdateAction(), 'SetDocument');
            assert.equal(createdDataSource.getDeleteAction(), 'DeleteDocument');
            //assert.equal(createdDataSource.getPageSize(), 50);
            //assert.equal(createdDataSource.getPageNumber(), 10);
            assert.isTrue(createdDataSource.getFillCreatedItem());
        });
    });

    describe('dataSource CRUD operations', function () {
        it('should get list of data', function () {

            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            var dataSource = builder.buildType(fakeView(), 'DocumentDataSource', metadata);
            dataSource.setListMode();

            var invokes = false;

            dataSource.getItems(function (data) {
                invokes = true;
                assert.isTrue(data.length > 0, "data provider returns items");
            });

            assert.isTrue(invokes, "data provider has been invoked");
        });

        it('should get editing record', function () {


            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            var dataSource = builder.buildType(fakeView(), 'DocumentDataSource', metadata);
            dataSource.setEditMode();
            dataSource.setIdFilter('1');

            var items = dataSource.getItems(
                function (data) {
                    assert.equal(data.length, 1);
                    assert.equal(data[0].Id, '1');
                });
        });

        it('should update items', function () {


            var mode = 'Created';

            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider(function () {
                    return mode;
                });
            });

            //parentView need to specify or handler shouldn't invoked because of empty context. Context needed to run script handler
            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);
            dataSource.setListMode();
            dataSource.resumeUpdate();
            dataSource.getItems(function (items) {
                assert.equal(items[0].Id, '1');
                assert.equal(items[1].Id, '2');
            });


            //changes to update mode forces reload updated items to datasource
            mode = 'Updated';

            var itemsUpdatedInvokes = false;

            dataSource.onItemsUpdated(function (dataSourceName, value) {
                itemsUpdatedInvokes = true;
            });

            dataSource.updateItems();

            assert.isTrue(itemsUpdatedInvokes, 'data source items has not been updated');

            dataSource.getItems(function (items) {
                assert.equal(items[0].Id, '4');
                assert.equal(items[1].Id, '5');
            });


        });

        it('should save item', function () {
            //Given
            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            //parentView need to specify or handler shouldn't invoked because of empty context. Context needed to run script handler
            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);
            dataSource.setListMode();

            var item = {
                "Id": '1',
                "FirstName": 'Степан',
                "LastName": 'Степанов'
            };

            //check onItemSavedHandler invoke
            /*var onItemSavedHandlerInvokes = false;debugger;
            dataSource.onItemSaved(function (dataSourceName, value) {
                onItemSavedHandlerInvokes = true;
                assert.equal(value.value, item);
            });*/

            //record with identifier '1' should be replaced
            //When
            dataSource.saveItem(item);

            //assert.isTrue(onItemSavedHandlerInvokes);

            //Then
            dataSource.getItems(function (items) {
                assert.equal(items[0].FirstName, 'Степан');
                assert.equal(items[0].LastName, 'Степанов');
            });

        });

        it('should create item', function () {
            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);

            var item = null;

            var onItemCreatedInvokes = false;
            dataSource.onItemCreated(function (dataSourceName, value) {
                onItemCreatedInvokes = true;
            });

            dataSource.createItem(function (data) {
                assert.isTrue(dataSource.isModifiedItems());
            }, function (err) {
                assert.fail(err);
            });

        });

        it('should delete item', function () {
            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            //parentView need to specify or handler shouldn't invoked because of empty context. Context needed to run script handler
            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);
            dataSource.setListMode();

            var items = null;
            dataSource.getItems(function (data) {
                items = data;
            });

            var onItemDeletedHandlerInvokes = false;
            dataSource.onItemDeleted(function (dataSourceName, value) {
                onItemDeletedHandlerInvokes = true;
                assert.equal(value.value, items[0]);
            });

            var itemDeletedId = items[0].Id;
            dataSource.deleteItem(items[0]);

            items = dataSource.getItems(function (items) {
                for (var i = 0; i < items.length; i++) {
                    if (items[i].Id === itemDeletedId) {
                        assert.fail();
                    }
                }
            });

            assert.isTrue(onItemDeletedHandlerInvokes);
        });
    });

    describe('dataSource paging operations', function () {
        it('should change page of data for list mode', function () {
            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            var dataSource = builder.buildType(fakeView(), 'DocumentDataSource', metadata);
            dataSource.setListMode();

            dataSource.setPageSize(2);
            dataSource.setPageNumber(1);

            dataSource.getItems(function (items) {
                assert.equal(items.length, 1);
                assert.equal(items[0].Id, '10');
            }, function (err) {
                assert.fail(err)
            });
        });


        it('should not effect pagesize and pagenumber for editdatasource', function () {
            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            var dataSource = builder.buildType(fakeView(), 'DocumentDataSource', metadata);

            dataSource.setIdFilter('1');
            dataSource.setEditMode();
            dataSource.setPageSize(2);
            dataSource.setPageNumber(10);

            dataSource.getItems(function (items) {
                assert.equal(items.length, 1);
                assert.equal(items[0].Id, '1');
            });

        });
    });

    describe('dataSource events invoking', function () {

        var parentView = fakeView(),
            view = fakeView({
                name: 'TestView'
            });

        it('should set parentview for dataSource', function () {
            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            var dataSource = builder.buildType(view, 'DocumentDataSource', metadata);

            assert.equal(dataSource.getView(), view);
        });

        it('should invoke onPageNumberChanged and onPageSizeChanged for dataSource in list Mode', function () {

            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);

            var pageNumber = -1;
            var pageSize = 20;


            dataSource.onPageNumberChanged(function (dataSourceName, value) {
                pageNumber = value.value;
            });

            dataSource.onPageSizeChanged(function (dataSourceName, value) {
                pageSize = value.value;
            });

            dataSource.setPageNumber(1);

            assert.equal(pageNumber, 1);

            dataSource.setPageSize(20);

            assert.equal(pageSize, 20);
        });
    });

    describe('dataSource and dataBinding interaction', function () {

        var parentView = fakeView(),
            view = fakeView();

        it('should add and remove data binding', function () {

            var dataBinding = new PropertyBinding(view);

            var wasEvent = false;

            var action = function (dataSourceName, value) {
                wasEvent = true;
            };
            dataBinding.onSetPropertyValue(action);

            dataBinding.setPropertyValue(1);

            assert.equal(wasEvent, true);

            //Отписка от события не реализована
//            dataBinding.removeOnSetPropertyValue(action);
//
//            wasEvent = false;
//
//            dataBinding.setPropertyValue(1);
//
//            assert.equal(wasEvent, false);

        });
        it('should track dataBinding property value changed ', function () {


            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);

            var dataBinding = new PropertyBinding(parentView, dataSource.getName(), '$.LastName');

            var items = null;
            dataSource.getItems(function (data) {
                items = data;
            });

            dataSource.resumeUpdate();

            dataSource.addDataBinding(dataBinding);

            var valueSelected = null;
            dataBinding.onPropertyValueChanged(function (dataSourceName, value) {
                valueSelected = value.value;
            });

            dataSource.setSelectedItem(items[0]);

            assert.equal(valueSelected, 'Иванов');
        });

        it('should invoke dataBinding onPropertyValueChanged handler on reload data on dataSource', function () {

            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);

            var dataBinding = new PropertyBinding(parentView, dataSource.getName(), null);

            dataSource.addDataBinding(dataBinding);

            var itemsUpdated = false;
            dataBinding.onPropertyValueChanged(function (dataSourceName, value) {
                itemsUpdated = true;
            });

            dataSource.resumeUpdate();

            assert.isTrue(itemsUpdated);
        });

        it('should invoke dataSource onUpdateItems handler on reload data on dataSource', function () {
            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);

            var itemsUpdated = false;
            dataSource.onItemsUpdated(function (dataSourceName, value) {
                itemsUpdated = true;
            });

            dataSource.resumeUpdate();
            assert.isTrue(itemsUpdated);
        });

        it('should invoke dataSource onSelectedItem handler on select item in dataSource', function () {

            var provider = new FakeDataProvider();

            var itemToSelect = null;
            provider.getItems(null, 0, 10, null, function (data) {
                    itemToSelect = data[0];
                }
            );

            window.providerRegister.register('DocumentDataSource', function () {
                return provider;
            });

            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);


            var itemSelected = false;
            dataSource.onSelectedItemChanged(function (dataSourceName, value) {
                itemSelected = true;
            });

            dataSource.resumeUpdate();
            dataSource.setSelectedItem(itemToSelect);


            assert.isTrue(itemSelected);
        });

        it('should invoke dataSource specified onSelectedItem handler on select item in dataSource', function () {

            var provider = new FakeDataProvider();

            var itemToSelect = null;
            provider.getItems(null, 0, 10, null, function (data) {
                itemToSelect = data[0];
            });

            window.providerRegister.register('DocumentDataSource', function () {
                return provider;
            });

            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);

            dataSource.setSelectedItem(itemToSelect);

            var selectedItem = dataSource.getSelectedItem();

            assert.equal(JSON.stringify(selectedItem), JSON.stringify(itemToSelect));
        });
        it('should dataBinding setPropertyValue invoke dataBinding onSetPropertyValue event', function () {

            var provider = new FakeDataProvider();

            window.providerRegister.register('DocumentDataSource', function () {
                return provider;
            });

            var propertyValue = null;
            provider.getItems(null, 0, 10, null, function (data) {
                propertyValue = data[0];
            });

            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);

            var dataBinding = new PropertyBinding(parentView, dataSource.getName(), null);

            dataSource.resumeUpdate();

            dataSource.addDataBinding(dataBinding);

            var onSetPropertyValueInvokes = false;

            dataBinding.onSetPropertyValue(function (dataSourceName, value) {
                onSetPropertyValueInvokes = true;
            });


            dataBinding.setPropertyValue(propertyValue);

            assert.isTrue(onSetPropertyValueInvokes);
        });
        it('should dataBinding setPropertyValue invoke dataSource handler and notify all dataSource related dataBindings', function () {
            var provider = new FakeDataProvider();

            window.providerRegister.register('DocumentDataSource', function () {
                return provider;
            });

            var propertyValue = null;
            provider.getItems(null, 0, 10, null, function (data) {
                propertyValue = data[1];
            });

            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);

            var dataBinding = new PropertyBinding(parentView, dataSource.getName(), '$.LastName');

            var dataBindingNotified = new PropertyBinding(parentView, dataSource.getName(), '$.LastName');

            dataSource.resumeUpdate();

            dataSource.addDataBinding(dataBinding);

            dataSource.addDataBinding(dataBindingNotified);

            var wasNotifyDataBinding = false;

            dataBinding.setPropertyValue(propertyValue);

            dataBindingNotified.onPropertyValueChanged(function (dataSourceName, value) {
                wasNotifyDataBinding = true;
                assert.equal(JSON.stringify(value.value), JSON.stringify(propertyValue));
            });


            assert.isTrue(wasNotifyDataBinding);
        });
        /*it('should dataBinding setPropertyValue invoke dataSource handler and set isModified flag and replace selectedItem properties', function () {debugger;
            var provider = new FakeDataProvider();

            window.providerRegister.register('DocumentDataSource', function () {
                return provider;
            });

            var propertyValue = null;
            provider.getItems(null, 0, 10, null, function (data) {
                propertyValue = data[0];
            });

            //LastName should changed on
            var propertyValueChanged = 'Сидоров';

            var dataSource = builder.buildType(parentView, 'DocumentDataSource', metadata);

            var dataBinding = new PropertyBinding(parentView, dataSource.getName(), '$.LastName');

            dataSource.resumeUpdate();

            dataSource.addDataBinding(dataBinding);

            dataSource.setSelectedItem(propertyValue);

            dataBinding.setPropertyValue(propertyValueChanged);

            assert.isTrue(dataSource.isModified(dataSource.getSelectedItem()));

            assert.equal(dataSource.getSelectedItem().LastName, propertyValueChanged);

            dataSource.getItems(function (data) {
                assert.isFalse(dataSource.isModified(data[1]));
            });

            //check clear isModified for item on saveItem
            dataSource.saveItem(dataSource.getSelectedItem());

            assert.isFalse(dataSource.isModified(dataSource.getSelectedItem()));
        });*/

    });
});

function FakeDataProvider(mode) {

    var items = [
        {
            "Id": '1',
            "FirstName": "Иван",
            "LastName": "Иванов"
        },
        {
            "Id": '2',
            "FirstName": "Петр",
            "LastName": "Петров"
        },
        {
            "Id": '10',
            "FirstName": "Анна",
            "LastName": "Сергеева"

        }
    ];

    var itemsUpdated = [
        {
            "Id": '4',
            "FirstName": "Федор",
            "LastName": "Федоров"
        },
        {
            "Id": '5',
            "FirstName": "Сидор",
            "LastName": "Сидоров"
        }
    ];

    this.getItems = function (criteriaList, pageNumber, pageSize, sorting, resultCallback) {
        if (mode === undefined || mode() === 'Created') {

            var result = [];
            var allItems = items;
            for (var i = 0; i < pageSize; i++) {
                var itemIndex = i + (pageNumber * pageSize);
                if (itemIndex < allItems.length) {
                    result.push(items[itemIndex]);
                }
                else {
                    break;
                }
            }
            resultCallback(result);
        }
        else {
            resultCallback(itemsUpdated);
        }
    };

    this.createItem = function (resultCallback) {
        resultCallback({});
    };

    this.replaceItem = function (value, warnings, resultCallback) {

        var itemIndex = -1;

        for (var i = 0; i < items.length; i++) {
            if (items[i].Id === value.Id) {
                itemIndex = i;
                break;
            }
        }

        if (itemIndex !== -1) {
            items[itemIndex] = value;
        }
        else {
            items.push(value);
        }

        resultCallback(items);
    };

    this.deleteItem = function (value, resultCallback) {
        var itemIndex = items.indexOf(value);
        items.splice(itemIndex, 1);
        resultCallback(items);
    };

    this.getItem = function (itemId, resultCallback) {
        for (var i = 0; i < items.length; i++) {
            if (items[i].Id === itemId) {
                resultCallback([items[i]]);
                return;
            }
        }
        resultCallback(null);
    };

}

function FakeMetadataProvider() {

    this.getViewMetadata = function (resultCallback) {

        return  {
            ConfigId: 'Structure',
            DocumentId: 'Common',
            ViewType: 'HomePage'
        };
    };


    this.getMenuMetadata = function (resultCallback) {

        throw 'not implemented getMenuMetadata FakeMetadataProvider';

    };


}
describe("AndValidator", function () {

    var falseValidator = new FalseValidator();

    var trueValidator = new TrueValidator();

    var failureTestCase =
        [
            [ falseValidator ],
            [ falseValidator, falseValidator ],
            [ falseValidator, trueValidator ],
            [ trueValidator, falseValidator ],
            [ falseValidator, falseValidator, falseValidator ],
            [ falseValidator, falseValidator, trueValidator ],
            [ falseValidator, trueValidator, falseValidator ],
            [ falseValidator, trueValidator, trueValidator ],
            [ trueValidator, falseValidator, falseValidator ],
            [ trueValidator, falseValidator, trueValidator ],
            [ trueValidator, trueValidator, falseValidator ]
        ];

    var successTestCase =
        [
            [],
            [ trueValidator ],
            [ trueValidator, trueValidator ],
            [ trueValidator, trueValidator, trueValidator ]
        ];

    var propertyTestCase =
        [
            { parent: null, property: null, expected: "" },
            { parent: null, property: "", expected: "" },
            { parent: "", property: null, expected: "" },
            { parent: "", property: "", expected: "" },
            { parent: "Parent", property: null, expected: "Parent" },
            { parent: "Parent", property: "", expected: "Parent" },
            { parent: null, property: "Property", expected: "Property" },
            { parent: "", property: "Property", expected: "Property" },
            { parent: "Parent", property: "Property", expected: "Parent.Property" }
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {

            // Given

            var validator = new AndValidator();
            validator.operators = failureTestCase[c];

            var falseOperatorCount = failureTestCase[c].filter(function (i) {
                return i === falseValidator
            }).length;

            // When
            var result = { };
            var isValid = validator.validate("", { }, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isNotNull(result.Items);
            assert.isDefined(result.Items);
            assert.equal(result.Items.length, falseOperatorCount);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {

            // Given

            var validator = new AndValidator();
            validator.operators = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", { }, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });

    it("should build validation result", function () {
        for (var c = 0; c < propertyTestCase.length; ++c) {

            // Given
            var validator = new AndValidator();
            validator.property = propertyTestCase[c].property;
            validator.operators = [ falseValidator ];

            // When
            var result = { };
            var isValid = validator.validate(propertyTestCase[c].parent, { }, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isNotNull(result.Items);
            assert.isDefined(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Property, propertyTestCase[c].expected);
        }
    });
});
describe("AndValidatorBuilder", function () {
    it("should build", function () {
        // Given

        var factory = new createValidationBuilderFactory();

        var meta = {
            And: {
                Property: "Property1",
                Operators: [
                    {
                        IsMoreThan: {
                            Message: "Message1",
                            Value: 0
                        }
                    },
                    {
                        IsLessThan: {
                            Message: "Message2",
                            Value: 3
                        }
                    }
                ]
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.isDefined(validator);
        assert.isNotNull(validator);
        assert.equal(validator.property, meta.And.Property);
        assert.equal(validator.operators.length, 2);
        assert.equal(validator.operators[0].message, meta.And.Operators[0].IsMoreThan.Message);
        assert.equal(validator.operators[1].message, meta.And.Operators[1].IsLessThan.Message);
    });
});
describe("NotValidator", function () {
    it("should validate when failure", function () {
        // Given
        var validator = new NotValidator();
        validator.operator = new TrueValidator();
        validator.message = "Error";

        // When
        var result = { };
        var isValid = validator.validate("", { }, result);

        // Then
        assert.isFalse(isValid);
        assert.isFalse(result.IsValid);
        assert.isTrue(result.Items !== null && result.Items !== undefined && result.Items.length === 1);
        assert.equal(validator.message, result.Items[0].Message);
    });

    it("should validate when success", function () {
        // Given
        var validator = new NotValidator();
        validator.operator = new FalseValidator();
        validator.message = "Error";

        // When
        var result = { };
        var isValid = validator.validate("", { }, result);

        // Then
        assert.isTrue(isValid);
        assert.isTrue(result.IsValid);
        assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
    });
});
describe("NotValidatorBuilder", function () {
    it("should build", function () {
        // Given

        var factory = new createValidationBuilderFactory();

        var meta = {
            Not: {
                Message: "Значение не может быть равно 1234",
                Property: "NotProperty1",
                Operator: {
                    IsEqual: {
                        Message: "IsEqual1",
                        Property: "IsEqualProperty1",
                        Value: 1234
                    }
                }
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.isDefined(validator);
        assert.isNotNull(validator);
        assert.equal(validator.message, meta.Not.Message);
        assert.equal(validator.property, meta.Not.Property);
        assert.equal(validator.operator.value, meta.Not.Operator.IsEqual.Value);
    });
});
describe("OrValidator", function () {

    var falseValidator = new FalseValidator();

    var trueValidator = new TrueValidator();

    var failureTestCase =
        [
            [ ],
            [ falseValidator ],
            [ falseValidator, falseValidator ],
            [ falseValidator, falseValidator, falseValidator ]
        ];

    var successTestCase =
        [
            [ trueValidator ],
            [ falseValidator, trueValidator ],
            [ trueValidator, falseValidator ],
            [ trueValidator, trueValidator ],
            [ falseValidator, falseValidator, trueValidator ],
            [ falseValidator, trueValidator, falseValidator ],
            [ falseValidator, trueValidator, trueValidator ],
            [ trueValidator, falseValidator, falseValidator ],
            [ trueValidator, falseValidator, trueValidator ],
            [ trueValidator, trueValidator, falseValidator ],
            [ trueValidator, trueValidator, trueValidator ]
        ];

    var propertyTestCase =
        [
            { parent: null, property: null, expected: "" },
            { parent: null, property: "", expected: "" },
            { parent: "", property: null, expected: "" },
            { parent: "", property: "", expected: "" },
            { parent: "Parent", property: null, expected: "Parent" },
            { parent: "Parent", property: "", expected: "Parent" },
            { parent: null, property: "Property", expected: "Property" },
            { parent: "", property: "Property", expected: "Property" },
            { parent: "Parent", property: "Property", expected: "Parent.Property" }
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {

            // Given

            var validator = new OrValidator();
            validator.operators = failureTestCase[c];

            var falseOperatorCount = failureTestCase[c].filter(function (i) {
                return i === falseValidator
            }).length;

            // When
            var result = { };
            var isValid = validator.validate("", { }, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isNotNull(result.Items);
            assert.isDefined(result.Items);
            assert.equal(result.Items.length, falseOperatorCount);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {

            // Given

            var validator = new OrValidator();
            validator.operators = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", { }, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });

    it("should build validation result", function () {
        for (var c = 0; c < propertyTestCase.length; ++c) {

            // Given
            var validator = new OrValidator();
            validator.property = propertyTestCase[c].property;
            validator.operators = [ falseValidator ];

            // When
            var result = { };
            var isValid = validator.validate(propertyTestCase[c].parent, { }, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isNotNull(result.Items);
            assert.isDefined(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Property, propertyTestCase[c].expected);
        }
    });
});
describe("OrValidatorBuilder", function () {
    it("should build", function () {
        // Given

        var factory = new createValidationBuilderFactory();

        var meta = {
            Or: {
                Property: "Property1",
                Operators: [
                    {
                        IsLessThan: {
                            Message: "Значение должно быть меньше 0",
                            Value: 0
                        }
                    },
                    {
                        IsMoreThan: {
                            Message: "Значение должно быть больше 3",
                            Value: 3
                        }
                    }
                ]
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.isDefined(validator);
        assert.isNotNull(validator);
        assert.equal(validator.property, meta.Or.Property);
        assert.equal(validator.operators.length, 2);
        assert(validator.operators[0].message, meta.Or.Operators[0].IsLessThan.Message);
        assert(validator.operators[1].message, meta.Or.Operators[1].IsMoreThan.Message);
    });
});
describe("AllValidator", function () {

    var testPredicate = function (i) {
        return i === 3;
    };

    var testValidator = new PredicateValidator();
    testValidator.message = "Error";
    testValidator.predicate = testPredicate;

    var failureTestCase =
        [
            [ 1 ],
            [ 1, 2 ],
            [ 1, 2, 3 ]
        ];

    var successTestCase =
        [
            [ ],
            [ 3 ],
            [ 3, 3 ],
            [ 3, 3, 3 ]
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {

            // Given

            var target = failureTestCase[c];

            var validator = new AllValidator();
            validator.operator = testValidator;

            var falseItemCount = target.filter(function (i) {
                return !testPredicate(i);
            }).length;

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, falseItemCount);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {

            // Given

            var target = successTestCase[c];

            var validator = new AllValidator();
            validator.operator = testValidator;

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });

    it("should build validation result", function () {
        // Given
        var validator = new AllValidator();
        validator.operator = testValidator;

        // When
        var result = { };
        var isValid = validator.validate("Collection1", [ 1, 2 ], result);

        // Then
        assert.isFalse(isValid);
        assert.isFalse(result.IsValid);
        assert.isDefined(result.Items);
        assert.isNotNull(result.Items);
        assert.equal(result.Items.length, 2);
        assert.equal(result.Items[0].Property, "Collection1.0");
        assert.equal(result.Items[1].Property, "Collection1.1");
        assert.equal(result.Items[0].Message, testValidator.message);
        assert.equal(result.Items[1].Message, testValidator.message);
    });
});
describe("AllValidatorBuilder", function () {
    it("should build", function () {
        // Given

        var factory = new createValidationBuilderFactory();

        var meta = {
            All: {
                Operator: {
                    IsLessThan: {
                        Property: "LessThanProperty1",
                        Message: "LessThanMessage1",
                        Value: 3
                    }
                }
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.isDefined(validator);
        assert.isNotNull(validator);
        assert.equal(validator.operator.value, 3);
        assert.equal(validator.operator.property, meta.All.Operator.IsLessThan.Property);
        assert.equal(validator.operator.message, meta.All.Operator.IsLessThan.Message);
    });
});
describe("AnyValidator", function () {

    var testPredicate = function (i) {
        return i === 3;
    };

    var testValidator = new PredicateValidator();
    testValidator.message = "Error";
    testValidator.predicate = testPredicate;

    var failureTestCase =
        [
            [ ],
            [ 1 ],
            [ 1, 2 ]
        ];

    var successTestCase =
        [
            [ 1, 2, 3 ]
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {

            // Given

            var target = failureTestCase[c];

            var validator = new AnyValidator();
            validator.operator = testValidator;

            var falseItemCount = target.filter(function (i) {
                return !testPredicate(i);
            }).length;

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, falseItemCount);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {

            // Given

            var target = successTestCase[c];

            var validator = new AnyValidator();
            validator.operator = testValidator;

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });

    it("should build validation result", function () {
        // Given
        var validator = new AnyValidator();
        validator.operator = testValidator;

        // When
        var result = { };
        var isValid = validator.validate("Collection1", [ 1, 2 ], result);

        // Then
        assert.isFalse(isValid);
        assert.isFalse(result.IsValid);
        assert.isDefined(result.Items);
        assert.isNotNull(result.Items);
        assert.equal(result.Items.length, 2);
        assert.equal(result.Items[0].Property, "Collection1.0");
        assert.equal(result.Items[1].Property, "Collection1.1");
        assert.equal(result.Items[0].Message, testValidator.message);
        assert.equal(result.Items[1].Message, testValidator.message);
    });
});
describe("AnyValidatorBuilder", function () {
    it("should build", function () {
        // Given

        var factory = new createValidationBuilderFactory();

        var meta = {
            Any: {
                Operator: {
                    IsLessThan: {
                        Property: "LessThanProperty1",
                        Message: "LessThanMessage1",
                        Value: 3
                    }
                }
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.isDefined(validator);
        assert.isNotNull(validator);
        assert.equal(validator.operator.value, 3);
        assert.equal(validator.operator.property, meta.Any.Operator.IsLessThan.Property);
        assert.equal(validator.operator.message, meta.Any.Operator.IsLessThan.Message);
    });
});
describe("IsContainsCollectionValidator", function () {

    var validator = new IsContainsCollectionValidator();
    validator.message = "Error";
    validator.value = 3;

    var failureTestCase =
        [
            null,
            [],
            [ 1, 2 ]
        ];

    var successTestCase =
        [
            [ 1, 2, 3 ]
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {

            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {

            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsContainsCollectionValidatorBuilder", function () {
    it("should build", function () {
        // Given

        var factory = new createValidationBuilderFactory();

        var meta = {
            IsContainsCollection: {
                Message: "Message1",
                Value: 1234
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.isDefined(validator);
        assert.isNotNull(validator);
        assert.equal(validator.value, meta.IsContainsCollection.Value);
        assert.equal(validator.message, meta.IsContainsCollection.Message);
    });
});	
describe("IsNullOrEmptyCollectionValidator", function () {

    var validator = new IsNullOrEmptyCollectionValidator();
    validator.message = "Error";

    var failureTestCase =
        [
            [ 1, 2, 3 ]
        ];

    var successTestCase =
        [
            null,
            []
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {

            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {

            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsNullOrEmptyCollectionValidatorBuilder", function () {
    it("should build", function () {
        // Given

        var factory = new createValidationBuilderFactory();

        var meta = {
            IsNullOrEmptyCollection: {
                Message: "Message1"
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.isDefined(validator);
        assert.isNotNull(validator);
        assert.equal(validator.message, meta.IsNullOrEmptyCollection.Message);
    });
});	
describe("IsAbsoluteUriValidator", function () {

    var validator = new IsAbsoluteUriValidator();
    validator.message = "Error";

    var failureTestCase =
        [
            null,
            undefined,
            "",
            "/display/MC/IsRelativeUri",
            123
        ];

    var successTestCase =
        [
            "http://wiki.infinnity.lan:8081/display/MC/IsAbsoluteUri",
            "https://wiki.infinnity.lan:8081/display/MC/IsAbsoluteUri"
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsAbsoluteUriBuilder", function(){
    it("should return true when collection exist value", function(){
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsAbsoluteUri:{
                Property: "Property1",
                Message: "Message1"
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsAbsoluteUri.Message);
        assert.equal(validator.property, meta.IsAbsoluteUri.Property);
    });
});
describe("IsContainsValidator", function () {

    var validator = new IsContainsValidator();
    validator.message = "Error";
    validator.value = "Abc";

    var failureTestCase =
        [
            null,
            "",
            "Xyz"
        ];

    var successTestCase =
        [
            "Abc",
            "abc",
            "AbcXyz",
            "abcXyz",
            "XyAbcz",
            "Xyabcz",
            "XyzAbc",
            "Xyzabc"
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsContainsBuilder", function() {
    it("should return true if target exist value", function () {
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsContains:{
                Message: "Message1",
                Value: "Abc"
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsContains.Message);
        assert.equal(validator.value, meta.IsContains.Value);
    });
});
describe("IsDefaultValueValidator", function () {

    var validator = new IsDefaultValueValidator();
    validator.message = "Error";

    var failureTestCase =
        [
            123,
            1.23,
            "abc",
            { },
            [ ]
        ];

    var successTestCase =
        [
            null,
            undefined,
            false,
            0,
            0.0
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsDefaultValueBuilder", function () {
    it("should return true when target is default", function () {
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsDefaultValue:{
                Message: "Message1",
                Property: "Property1"
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsDefaultValue.Message);
        assert.equal(validator.property, meta.IsDefaultValue.Property);
    });
});
describe("IsEndsWithValidator", function () {

    var validator = new IsEndsWithValidator();
    validator.message = "Error";
    validator.value = "Abc";

    var failureTestCase =
        [
            null,
            "",
            "Xyz",
            "AbcXyz",
            "abcXyz",
            "AbcXyz",
            "abcXyz"
        ];

    var successTestCase =
        [
            "Abc",
            "abc",
            "XyzAbc",
            "Xyzabc"
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsEndsWithBuilder", function() {
    it("should return true if target ends with value", function () {
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsEndsWith:{
                Message: "Message1",
                Value: "Abc"
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsEndsWith.Message);
        assert.equal(validator.value, meta.IsEndsWith.Value);
    });
});
describe("IsEqualValidator", function () {

    var failureTestCase =
        [
            { target: "", value: "Abc" },
            { target: "Abc", value: "" },
            { target: null, value: 123 },
            { target: 123, value: null },
            { target: null, value: new Date(2014, 0, 1) },
            { target: new Date(2014, 0, 1), value: null },
            { target: null, value: "2014-01-01" }
        ];

    var successTestCase =
        [
            { target: null, value: null },
            { target: "", value: "" },
            { target: "Abc", value: "Abc" },
            { target: 123, value: 123 },
            // Todo: { target: new Date(2014, 0, 1), value: new Date(2014, 0, 1) },
            // Todo: { target: new Date(2014, 0, 1), value: "2014-01-01" }
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var testCase = failureTestCase[c];
            var validator = new IsEqualValidator();
            validator.message = "Error";
            validator.value = testCase.value;

            // When
            var result = { };
            var isValid = validator.validate("", testCase.target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var testCase = successTestCase[c];
            var validator = new IsEqualValidator();
            validator.message = "Error";
            validator.value = testCase.value;

            // When
            var result = { };
            var isValid = validator.validate("", testCase.target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsEqualBuilder", function () {
    it("should return true when target is equal value", function () {
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsEqual:{
                Message: "Message1",
                Value: 1234
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsEqual.Message);
        assert.equal(validator.value, meta.IsEqual.Value);
    });
});
describe("IsGuidValidator", function () {

    var validator = new IsGuidValidator();
    validator.message = "Error";
    validator.value = "Abc";

    var failureTestCase =
        [
            null,
            "",
            "NotGuid"
        ];

    var successTestCase =
        [
            "436CAC70-4BD9-4476-B513-A13D7A6F197F",
            "{436CAC70-4BD9-4476-B513-A13D7A6F197F}"
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsGuidBuilder", function(){
   it("should return true if target is GUID", function(){
       // Given
       var factory = new createValidationBuilderFactory();

       var meta = {
           IsGuid:{
               Property: "Property1",
               Message: "Message1"
           }
       };

       // When
       var validator = factory.build(meta);

       // Then
       assert.equal(validator.message, meta.IsGuid.Message);
       assert.equal(validator.value, meta.IsGuid.Value);
    });
});
describe("IsInValidator", function () {

    var validator = new IsInValidator();
    validator.message = "Error";
    validator.items = [ 1, 2, 3 ];

    var failureTestCase =
        [
            null,
            0,
            4
        ];

    var successTestCase =
        [
            1,
            2,
            3
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsInBuilder", function () {
    it("should return true if Items exist target", function () {
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsIn:{
                Message: "Message1",
                Property: "Property1",
                Items: [ 1, 2, 3 ]
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.items.length, 3);
        assert.equal(validator.message, meta.IsIn.Message);
        assert.equal(validator.property, meta.IsIn.Property);
    });
});
describe("IsLessThanOrEqualValidator", function () {

    var failureTestCase =
        [
            { target: null, value: 123 },
            { target: 1234, value: 123 },
            { target: null, value: new Date(2014, 0, 1) },
            { target: new Date(2014, 0, 2), value: new Date(2014, 0, 1) },
            { target: null, value: "2014-01-01" },
            { target: new Date(2014, 0, 2), value: "2014-01-01" }
        ];

    var successTestCase =
        [
            { target: 123, value: 123 },
            { target: 123, value: 1234 },
            { target: new Date(2014, 0, 1), value: new Date(2014, 0, 1) },
            { target: new Date(2014, 0, 1), value: new Date(2014, 0, 2) }
            // Todo: { target: new Date(2014, 0, 1), value: "2014-01-01" },
            // Todo: { target: new Date(2014, 0, 1), value: "2014-01-02" }
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var testCase = failureTestCase[c];
            var validator = new IsLessThanOrEqualValidator();
            validator.message = "Error";
            validator.value = testCase.value;

            // When
            var result = { };
            var isValid = validator.validate("", testCase.target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var testCase = successTestCase[c];
            var validator = new IsLessThanOrEqualValidator();
            validator.message = "Error";
            validator.value = testCase.value;

            // When
            var result = { };
            var isValid = validator.validate("", testCase.target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsLessThanOrEqualBuilder", function () {
    it("should return true if target <= value", function () {
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsLessThanOrEqual:{
                Message: "Message1",
                Value: 1234
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsLessThanOrEqual.Message);
        assert.equal(validator.value, meta.IsLessThanOrEqual.Value);
    });
});
describe("IsLessThanValidator", function () {

    var failureTestCase =
        [
            { target: null, value: 123 },
            { target: 123, value: 123 },
            { target: 124, value: 123 },
            { target: null, value: new Date(2014, 0, 1) },
            { target: new Date(2014, 0, 1), value: new Date(2014, 0, 1) },
            { target: new Date(2014, 0, 2), value: new Date(2014, 0, 1) },
            { target: null, value: "2014-01-01" },
            { target: new Date(2014, 0, 1), value: "2014-01-01" },
            { target: new Date(2014, 0, 2), value: "2014-01-01" }
        ];

    var successTestCase =
        [
            { target: 123, value: 1234 },
            { target: new Date(2014, 0, 1), value: new Date(2014, 0, 2) }
            // Todo: { target: new Date(2014, 0, 1), value: "2014-01-02" }
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var testCase = failureTestCase[c];
            var validator = new IsLessThanValidator();
            validator.message = "Error";
            validator.value = testCase.value;

            // When
            var result = { };
            var isValid = validator.validate("", testCase.target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var testCase = successTestCase[c];
            var validator = new IsLessThanValidator();
            validator.message = "Error";
            validator.value = testCase.value;

            // When
            var result = { };
            var isValid = validator.validate("", testCase.target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsLessThanBuilder", function () {
    it("should return true if target < value", function () {
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsLessThan:{
                Message: "Message1",
                Value: 1234
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsLessThan.Message);
        assert.equal(validator.value, meta.IsLessThan.Value);
    });
});

describe("IsMoreThanOrEqualValidator", function () {

    var failureTestCase =
        [
            { target: null, value: 123 },
            { target: 123, value: 1234 },
            { target: null, value: new Date(2014, 0, 1) },
            { target: new Date(2014, 0, 1), value: new Date(2014, 0, 2) },
            { target: null, value: "2014-01-01" },
            { target: new Date(2014, 0, 1), value: "2014-01-02" }
        ];

    var successTestCase =
        [
            { target: 123, value: 123 },
            { target: 1234, value: 1234 },
            { target: new Date(2014, 0, 1), value: new Date(2014, 0, 1) },
            { target: new Date(2014, 0, 2), value: new Date(2014, 0, 1) }
            // Todo: { target: new Date(2014, 0, 1), value: "2014-01-01" },
            // Todo: { target: new Date(2014, 0, 2), value: "2014-01-01" }
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var testCase = failureTestCase[c];
            var validator = new IsMoreThanOrEqualValidator();
            validator.message = "Error";
            validator.value = testCase.value;

            // When
            var result = { };
            var isValid = validator.validate("", testCase.target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var testCase = successTestCase[c];
            var validator = new IsMoreThanOrEqualValidator();
            validator.message = "Error";
            validator.value = testCase.value;

            // When
            var result = { };
            var isValid = validator.validate("", testCase.target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsMoreThanOrEqualBuilder", function () {
    it("should return true if target >= value", function () {
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsMoreThanOrEqual:{
                Message: "Message1",
                Value: 1234
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsMoreThanOrEqual.Message);
        assert.equal(validator.value, meta.IsMoreThanOrEqual.Value);
    });
});

describe("IsMoreThanValidator", function () {

    var failureTestCase =
        [
            { target: null, value: 123 },
            { target: 123, value: 123 },
            { target: 123, value: 1234 },
            { target: null, value: new Date(2014, 0, 1) },
            { target: new Date(2014, 0, 1), value: new Date(2014, 0, 1) },
            { target: new Date(2014, 0, 1), value: new Date(2014, 0, 2) },
            { target: null, value: "2014-01-01" },
            { target: new Date(2014, 0, 1), value: "2014-01-01" },
            { target: new Date(2014, 0, 1), value: "2014-01-02" }
        ];

    var successTestCase =
        [
            { target: 1234, value: 123 },
            { target: new Date(2014, 0, 2), value: new Date(2014, 0, 1) }
            // Todo: { target: new Date(2014, 0, 2), value: "2014-01-01" }
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var testCase = failureTestCase[c];
            var validator = new IsMoreThanValidator();
            validator.message = "Error";
            validator.value = testCase.value;

            // When
            var result = { };
            var isValid = validator.validate("", testCase.target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var testCase = successTestCase[c];
            var validator = new IsMoreThanValidator();
            validator.message = "Error";
            validator.value = testCase.value;

            // When
            var result = { };
            var isValid = validator.validate("", testCase.target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsMoreThanBuilder", function () {
    it("should return true if target > value", function () {
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsMoreThan:{
                Message: "Message1",
                Value: 1234
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsMoreThan.Message);
        assert.equal(validator.value, meta.IsMoreThan.Value);
    });
});

describe("IsNullOrEmptyValidator", function () {

    var validator = new IsNullOrEmptyValidator();
    validator.message = "Error";

    var failureTestCase =
        [
            " ",
            "Xyz"
        ];

    var successTestCase =
        [
            null,
            undefined,
            ""
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsNullOrEmptyBuilder", function(){
    it("should return true if target is Null or Empty", function(){
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsNullOrEmpty:{
                Message: "Message1",
                Property: "Property1"
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsNullOrEmpty.Message);
        assert.equal(validator.property, meta.IsNullOrEmpty.Property);
    });
});
describe("IsNullOrWhiteSpaceValidator", function () {

    var validator = new IsNullOrWhiteSpaceValidator();
    validator.message = "Error";

    var failureTestCase =
        [
            "Xyz",
            "Xyz ",
            " Xyz"
        ];

    var successTestCase =
        [
            null,
            undefined,
            "",
            " ",
            "  "
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsNullOrWhiteSpaceBuilder", function(){
    it("should return true if target is Null or Empty or WhiteSpace", function(){
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsNullOrWhiteSpace:{
                Message: "Message1",
                Property: "Property1"
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsNullOrWhiteSpace.Message);
        assert.equal(validator.property, meta.IsNullOrWhiteSpace.Property);
    });
});
describe("IsNullValidator", function () {

    var validator = new IsNullValidator();
    validator.message = "Error";

    var failureTestCase =
        [
            "",
            "Xyz",
            { },
            [ ],
            123
        ];

    var successTestCase =
        [
            null,
            undefined
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsNullBuilder", function () {
    it("should return true when target is null", function () {
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsNull:{
                Message: "Message1",
                Property: "Property1"
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsNull.Message);
        assert.equal(validator.property, meta.IsNull.Property);
    });
});
describe("IsRegexValidator", function () {

    var validator = new IsRegexValidator();
    validator.message = "Error";
    validator.pattern = "[0-9]+";

    var failureTestCase =
        [
            null,
            undefined,
            "",
            "Xyz",
            123
        ];

    var successTestCase =
        [
            "123"
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsRegexBuilder", function() {
    it("should return true if target ends with value", function () {
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsRegex:{
                Message: "Message1",
                Pattern: "[0-9]+"
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsRegex.Message);
        assert.equal(validator.pattern, meta.IsRegex.Pattern);
    });
});

describe("IsRelativeUriValidator", function () {

    var validator = new IsRelativeUriValidator();
    validator.message = "Error";

    var failureTestCase =
        [
            null,
            undefined,
            "",
            123
        ];

    var successTestCase =
        [
            "http://wiki.infinnity.lan:8081/display/MC/IsAbsoluteUri",
            "/display/MC/IsRelativeUri"
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsRelativeUriBuilder", function(){
    it("should return true if target is RelativeUri", function(){
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsRelativeUri:{
                Message: "Message1",
                Property: "Property1"
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsRelativeUri.Message);
        assert.equal(validator.property, meta.IsRelativeUri.Property);
    });
});
describe("IsStartsWithValidator", function () {

    var validator = new IsStartsWithValidator();
    validator.message = "Error";
    validator.value = "Abc";

    var failureTestCase =
        [
            null,
            undefined,
            "",
            "Xyz",
            "XyAbcz",
            "Xyabcz",
            "XyzAbc",
            "Xyzabc"
        ];

    var successTestCase =
        [
            "Abc",
            "abc",
            "AbcXyz",
            "abcXyz"
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsStartsWithBuilder", function() {
    it("should return true if target begin with value", function () {
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsStartsWith:{
                Message: "Message1",
                Value: "Abc"
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsStartsWith.Message);
        assert.equal(validator.value, meta.IsStartsWith.Value);
    });
});
describe("IsUriValidator", function () {

    var validator = new IsUriValidator();
    validator.message = "Error";

    var failureTestCase =
        [
            null,
            undefined,
            "",
            123
        ];

    var successTestCase =
        [
            "http://wiki.infinnity.lan:8081/display/MC/IsAbsoluteUri",
            "/display/MC/IsRelativeUri"
        ];

    it("should validate when failure", function () {
        for (var c = 0; c < failureTestCase.length; ++c) {
            // Given
            var target = failureTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isFalse(isValid);
            assert.isFalse(result.IsValid);
            assert.isDefined(result.Items);
            assert.isNotNull(result.Items);
            assert.equal(result.Items.length, 1);
            assert.equal(result.Items[0].Message, validator.message);
        }
    });

    it("should validate when success", function () {
        for (var c = 0; c < successTestCase.length; ++c) {
            // Given
            var target = successTestCase[c];

            // When
            var result = { };
            var isValid = validator.validate("", target, result);

            // Then
            assert.isTrue(isValid);
            assert.isTrue(result.IsValid);
            assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
        }
    });
});
describe("IsUriBuilder", function(){
    it("should return true if target is Uri", function(){
        // Given
        var factory = new createValidationBuilderFactory();

        var meta = {
            IsUri:{
                Message: "Message1",
                Property: "Property1"
            }
        };

        // When
        var validator = factory.build(meta);

        // Then
        assert.equal(validator.message, meta.IsUri.Message);
        assert.equal(validator.property, meta.IsUri.Property);
    });
});
describe("validationMethods", function () {
    describe("generalValidate", function () {

        var propertyTestCase =
            [
                { parent: null, property: null, expected: "" },
                { parent: null, property: "", expected: "" },
                { parent: "", property: null, expected: "" },
                { parent: "", property: "", expected: "" },
                { parent: "Parent", property: null, expected: "Parent" },
                { parent: "Parent", property: "", expected: "Parent" },
                { parent: null, property: "Property", expected: "Property" },
                { parent: "", property: "Property", expected: "Property" },
                { parent: "Parent", property: "Property", expected: "Parent.Property" }
            ];

        it("should build validation result when fail", function () {
            for (var c = 0; c < propertyTestCase.length; ++c) {
                // Given
                var validator = new FalseValidator();
                validator.property = propertyTestCase[c].property;
                validator.message = "Error";

                // When
                var result = { };
                var isValid = validator.validate(propertyTestCase[c].parent, { }, result);

                // Then
                assert.isFalse(isValid);
                assert.isFalse(result.IsValid);
                assert.isNotNull(result.Items);
                assert.isDefined(result.Items);
                assert.equal(result.Items.length, 1);
                assert.equal(result.Items[0].Property, propertyTestCase[c].expected);
            }
        });

        it("should build validation result when success", function () {
            for (var c = 0; c < propertyTestCase.length; ++c) {
                // Given
                var validator = new TrueValidator();
                validator.property = propertyTestCase[c].property;
                validator.message = "Error";

                // When
                var result = { };
                var isValid = validator.validate(propertyTestCase[c].parent, { }, result);

                // Then
                assert.isTrue(isValid);
                assert.isTrue(result.IsValid);
                assert.isTrue(result.Items === null || result.Items === undefined || result.Items.length === 0);
            }
        });
    });

    describe("combinePropertyPath", function () {
        it("should build property path", function () {
            assert.equal(combinePropertyPath(null, null), "");
            assert.equal(combinePropertyPath(null, ""), "");
            assert.equal(combinePropertyPath("", null), "");
            assert.equal(combinePropertyPath("", ""), "");
            assert.equal(combinePropertyPath("Parent", null), "Parent");
            assert.equal(combinePropertyPath("Parent", ""), "Parent");
            assert.equal(combinePropertyPath(null, "Property"), "Property");
            assert.equal(combinePropertyPath("", "Property"), "Property");
            assert.equal(combinePropertyPath("Parent", "Property"), "Parent.Property");

            assert.equal(combinePropertyPath(null, 9), "9");
            assert.equal(combinePropertyPath("", 9), "9");
            assert.equal(combinePropertyPath("Parent", 9), "Parent.9");
            assert.equal(combinePropertyPath(9, null), "9");
            assert.equal(combinePropertyPath(9, ""), "9");
            assert.equal(combinePropertyPath(9, "Property"), "9.Property");
        });
    });
});
describe('DateTimeEditMask', function () {
    describe('format', function () {

        it('successful build template', function () {
            //Given
            var editMask = new DateTimeEditMask();
            editMask.mask = "%dd MM yyyy г.";
            //When
            var template = editMask.buildTemplate();
            //Then
            assert.isArray(template);
            assert.lengthOf(template, 6);
        });

        it('successful format value', function () {
            //Given
            var editMask = new DateTimeEditMask();
            editMask.mask = "%dd MM yyyy г.";
            editMask.format = new DateTimeFormat();
            editMask.format.setFormat(editMask.mask);
            //When
            editMask.reset('2014-09-26T15:15');
            var text = editMask.getText();
            //Then
            assert.equal(text, '26 09 2014 г.');
        });

        it('successful input value', function () {
            //Given
            var editMask = new DateTimeEditMask();
            editMask.mask = "dd MM yyyy г.";
            editMask.format = new DateTimeFormat();
            editMask.format.setFormat(editMask.mask);
            //var template = editMask.buildTemplate();
            editMask.reset(null);
            //When
            var position = 0;
            position = editMask.setCharAt('1', position);
            position = editMask.setCharAt('9', position);
            position = editMask.setCharAt('0', position);
            position = editMask.setCharAt('7', position);
            position = editMask.setCharAt('2', position);
            position = editMask.setCharAt('0', position);
            position = editMask.setCharAt('1', position);
            position = editMask.setCharAt('4', position);
            var text = editMask.getText();
            //Then
            assert.equal(text, '19 07 2014 г.');
            assert.equal(position, 10)
        });

        it('successful navigation', function () {
            //Given
            var editMask = new DateTimeEditMask();
            editMask.mask = "dd MM yyyy г.";
            editMask.format = new DateTimeFormat();
            editMask.format.setFormat(editMask.mask);
            var date = new Date();
            editMask.reset(date);
            //When
            var position = 0;
            var start = editMask.moveToPrevChar(position);
            position = editMask.moveToNextChar(99);
            position = editMask.setNextValue(position);
            //Then
            var value = editMask.getValue();
            var text = editMask.getText();
            assert.equal(position, text.length - 3);
            assert.equal(date.getFullYear(), (new Date(value)).getFullYear());
        });

        it('successful delete char (right)', function () {
            //Given
            var editMask = new DateTimeEditMask();
            editMask.mask = "dd MM yyyy г.";
            editMask.format = new DateTimeFormat();
            editMask.format.setFormat(editMask.mask);

            var date = new Date(2014, 9, 6, 9, 30, 50, 0);  //06-10-2014 09:30:50
            editMask.reset(date);
            //When
            var position = 0;
            var start = editMask.moveToPrevChar(position);

            position = editMask.deleteCharRight(position);//"6_ 10 2014 г."
            position = editMask.deleteCharRight(position);//"__ 10 2014 г."

            //Then
            var text = editMask.getText();
            assert.equal(position, 3);
            assert.equal(text, "__ 10 2014 г.");
        });

        it('successful delete char (left)', function () {
            //Given
            var editMask = new DateTimeEditMask();
            editMask.mask = "dd MM yyyy г.";
            editMask.format = new DateTimeFormat();
            editMask.format.setFormat(editMask.mask);

            var date = new Date(2014, 9, 6, 9, 30, 50, 0);  //06-10-2014 09:30:50
            editMask.reset(date);
            //When
            var position = 8;
            var start = editMask.moveToPrevChar(position);

            position = editMask.deleteCharLeft(position);//"06 10 214_ г."
            position = editMask.deleteCharLeft(position);//"06 10 14__ г."

            //Then
            var text = editMask.getText();
            assert.equal(position, 6);
            assert.equal(text, "06 10 14__ г.");
        });

        it('successful set char', function () {
            //Given
            var editMask = new DateTimeEditMask();
            editMask.mask = "dd MM yyyy г.";
            editMask.format = new DateTimeFormat();
            editMask.format.setFormat(editMask.mask);

            editMask.reset(null);
            //When
            var position = 9;
            var start = editMask.moveToPrevChar(position); //"__ __ ____ г."

            position = editMask.setCharAt('2', position);
            position = editMask.setCharAt('0', position);
            position = editMask.setCharAt('1', position);
            position = editMask.setCharAt('4', position);

            //Then
            var text = editMask.getText();
            assert.equal(start, 8);
            assert.equal(position, 10);
            assert.equal(text, "__ __ 2014 г.");
        });


        it('successful delete value', function () {
            //Given
            var editMask = new DateTimeEditMask();
            editMask.mask = "dd MM yyyy г.";
            editMask.format = new DateTimeFormat();
            editMask.format.setFormat(editMask.mask);
            //var template = editMask.buildTemplate();
            editMask.reset(null);
            //When
            var position = 0;
            position = editMask.setCharAt('1', position);
            position = editMask.setCharAt('9', position);
            position = editMask.setCharAt('0', position);
            position = editMask.setCharAt('7', position);
            position = editMask.setCharAt('2', position);
            position = editMask.setCharAt('0', position);
            position = editMask.setCharAt('1', position);
            position = editMask.setCharAt('4', position);

            position = editMask.deleteCharLeft(position);// 4
            position = editMask.deleteCharLeft(position);// 1
            position = editMask.deleteCharLeft(position);// 0
            position = editMask.deleteCharLeft(position);// 2
            position = editMask.deleteCharLeft(position);// .
            position = editMask.deleteCharLeft(position);// 7
            position = editMask.deleteCharLeft(position);// 0
            position = editMask.deleteCharLeft(position);// .
            position = editMask.deleteCharLeft(position);// 9
            position = editMask.deleteCharLeft(position);// 1
            var text = editMask.getText();
            //Then
            assert.equal(text, '__ __ ____ г.');
            assert.equal(position, 0);
        });

    });


});
describe('NumberEditMask', function () {
    describe('format', function () {

        it('successful build template', function () {
            //Given
            var editMask = new DateTimeEditMask();
            editMask.mask = "%d MM yyyy г.";
            //When
            var template = editMask.buildTemplate();
            //Then
            assert.isArray(template);
            assert.lengthOf(template, 6);
        });

        it('successful format value', function () {
            //Given
            var editMask = new NumberEditMask();
            editMask.mask = "Цена n3 руб. за 1 кг";
            editMask.format = new NumberFormat();
            editMask.format.setFormat(editMask.mask);
            //When
            editMask.reset('50');
            var text = editMask.getText();
            //Then
            assert.equal(text, 'Цена 50,000 руб. за 1 кг');
        });

        it('successful setCharAt', function () {
            //Given
            var editMask = new NumberEditMask();
            editMask.mask = "Цена n3 руб. за 1 кг";
            editMask.format = new NumberFormat();
            editMask.format.setFormat(editMask.mask);

            //When
            editMask.reset('50');
            var position = 5;
            position = editMask.setCharAt('1', position);
            position = editMask.setCharAt('2', position);
            position = editMask.setCharAt('3', position);
            position = editMask.setCharAt('4', position);
            position = editMask.setCharAt(',', position);
            position = editMask.setCharAt('9', position);
            var text = editMask.getText();

            //Then
            assert.equal(text, 'Цена 123 450,900 руб. за 1 кг');
            assert.equal(position, 14);

        });

        it('successful setNextValue/setPrevValue', function () {
            //Given
            var editMask = new NumberEditMask();
            editMask.mask = "Цена n3 руб. за 1 кг";
            editMask.format = new NumberFormat();
            editMask.format.setFormat(editMask.mask);

            //When
            editMask.reset('50');
            var position = 5;
            position = editMask.setNextValue(position);
            position = editMask.setNextValue(position);
            position = editMask.setCharAt(',', position);
            position = editMask.setPrevValue(position);
            position = editMask.setPrevValue(position);
            var text = editMask.getText();

            //Then
            assert.equal(text, 'Цена 50,000 руб. за 1 кг');
            assert.equal(position, 8);

        });

        it('successful delete chars', function () {
            //Given
            var editMask = new NumberEditMask();
            editMask.mask = "Цена n3 руб. за 1 кг";
            editMask.format = new NumberFormat();
            editMask.format.setFormat(editMask.mask);

            //When
            editMask.reset(123456789.876);
            var position = 20;
            position = editMask.deleteCharLeft(position);   //"Цена 123 456 789,870 руб. за 1 кг"
            position = editMask.deleteCharLeft(position);   //"Цена 123 456 789,800 руб. за 1 кг"
            position = editMask.deleteCharLeft(position);   //"Цена 123 456 789,000 руб. за 1 кг"
            position = editMask.deleteCharLeft(position);   //"Цена 12 345 678,000 руб. за 1 кг"
            position = editMask.deleteCharLeft(position);   //"Цена 1 234 567,000 руб. за 1 кг"
            position = editMask.deleteCharLeft(position);   //"Цена 123 456,000 руб. за 1 кг"
            position = editMask.deleteCharLeft(position);   //"Цена 12 345,000 руб. за 1 кг"
            position = editMask.moveToPrevChar(position);
            position = editMask.moveToPrevChar(position);
            position = editMask.moveToPrevChar(position);
            position = editMask.moveToPrevChar(position);
            position = editMask.deleteCharRight(position);   //"Цена 1 245,000 руб. за 1 кг"
            position = editMask.deleteCharRight(position);   //"Цена 125,000 руб. за 1 кг"
            var text = editMask.getText();

            //Then
            assert.equal(text, 'Цена 125,000 руб. за 1 кг');
            assert.equal(position, 7);

        });

        it('successful movePrevChar', function () {
            //Given
            var editMask = new NumberEditMask();
            editMask.mask = "Цена n3 руб. за 1 кг";
            editMask.format = new NumberFormat();
            editMask.format.setFormat(editMask.mask);

            //When
            editMask.reset(1234.567);   //"Цена 1 234,567 руб. за 1 кг"
            var position = 14;
            position = editMask.moveToPrevChar(position);
            position = editMask.moveToPrevChar(position);
            position = editMask.moveToPrevChar(position);

            //Then
            assert.equal(position, 11);

        });

        it('successful decimalSeparator for currency', function () {
            //Given
            var editMask = new NumberEditMask();
            editMask.mask = "Цена c3 за 1 кг";
            editMask.format = new NumberFormat();
            editMask.format.setFormat(editMask.mask);

            //When
            editMask.reset(null);   //"Цена _,___ руб. за 1 кг"
            var position = 5;
            position = editMask.setCharAt('1', position);
            position = editMask.setCharAt(',', position);

            //Then
            assert.equal(position, 7);
            assert.equal(editMask.getText(), 'Цена 1,000р. за 1 кг');
        });

        it('successful decimal part for currency', function () {
            //Given
            var editMask = new NumberEditMask();
            editMask.mask = "Цена c2 за 1 кг";
            editMask.format = new NumberFormat();
            editMask.format.setFormat(editMask.mask);

            //When
            editMask.reset(null);   //"Цена _,___ руб. за 1 кг"
            var position = 5;
            position = editMask.setCharAt('1', position);
            position = editMask.setCharAt(',', position);
            position = editMask.setCharAt('2', position);
            position = editMask.setCharAt('3', position);
            position = editMask.setCharAt('4', position);

            //Then
            assert.equal(position, 9);
            assert.equal(editMask.getText(), 'Цена 1,23р. за 1 кг');

        });

        it('successful move to start', function () {
            //Given
            var editMask = new NumberEditMask();
            editMask.mask = "Цена c2 за 1 кг";
            editMask.format = new NumberFormat();
            editMask.format.setFormat(editMask.mask);

            //When
            editMask.reset(null);
            var position = editMask.moveToPrevChar(0);

            //Then
            assert.equal(position, 5);
            assert.equal(editMask.getText(), 'Цена _,__р. за 1 кг');

        });

    });




});
describe('RegexEditMask', function () {
    describe('format', function () {

        it('successful test mask', function () {
            //Given
            var editMask = new RegexEditMask();
            editMask.mask = '^[0-9]{4}$';

            //When
            editMask.reset('1234');

            //Then
            assert.equal(editMask.getValue(), '1234');
            assert.isTrue(editMask.getIsComplete('1234'));
            assert.isFalse(editMask.getIsComplete('123'));
        });

    });

});
describe('TemplateEditMask', function () {
    describe('format', function () {

        it('successful build mask', function () {
            //Given
            var editMask = new TemplateEditMask();

            //When

            //Then
            assert.isDefined(editMask);
        });

        it('successful build template', function () {
            //Given
            var editMask = new TemplateEditMask();
            editMask.mask = '+\\9(999)000-00-00';

            //When
            var template = editMask.buildTemplate();
            //Then
            assert.lengthOf(template, 16);
            assert.equal(template[0], '+');
            assert.equal(template[1], '9');
            assert.equal(template[2], '(');
            assert.isObject(template[3]);
            assert.isObject(template[4]);
            assert.isObject(template[5]);
            assert.equal(template[6], ')');
            assert.isObject(template[7]);
            assert.isObject(template[8]);
            assert.isObject(template[9]);
            assert.equal(template[10], '-');
            assert.isObject(template[11]);
            assert.isObject(template[12]);
            assert.equal(template[13], '-');
            assert.isObject(template[14]);
            assert.isObject(template[15]);
            assert.equal(editMask.getText(), '+9(___)___-__-__');
            assert.equal(editMask.getValue(), '+9()--')
        });

        it('successful move at start', function () {
            //Given
            var editMask = new TemplateEditMask();
            editMask.mask = '+7(999)000-00-00';

            //When
            editMask.reset();
            //Then
            var position = editMask.moveToPrevChar(0);
            assert.equal(position, 3);
        });

        it('successful to last', function () {
            //Given
            var editMask = new TemplateEditMask();
            editMask.mask = '+7(999)000-00-00';

            //When
            editMask.reset();
            //Then
            var position = editMask.moveToNextChar(editMask.mask.length);
            assert.equal(position, 16);
        });

        it('successful to set char', function () {
            //Given
            var editMask = new TemplateEditMask();
            editMask.mask = '+7 (999)000-00-00';

            //When
            editMask.reset();
            var position = editMask.moveToPrevChar(0);
            position = editMask.setCharAt('1', position);
            position = editMask.setCharAt('2', position);
            position = editMask.setCharAt('3', position);

            position = editMask.setCharAt('4', position);
            position = editMask.setCharAt('5', position);
            position = editMask.setCharAt('6', position);

            position = editMask.setCharAt('7', position);
            position = editMask.setCharAt('8', position);

            position = editMask.setCharAt('9', position);
            position = editMask.setCharAt('0', position);

            //Then
            assert.equal(position, 17);
            assert.equal(editMask.getValue(), '+7 (123)456-78-90');
        });

        it('successful to set char without MaskSaveLiteral', function () {
            //Given
            var editMask = new TemplateEditMask();
            editMask.mask = '+7 (999)000-00-00';
            editMask.maskSaveLiteral = false;

            //When
            editMask.reset();
            var position = editMask.moveToPrevChar(0);
            position = editMask.setCharAt('1', position);
            position = editMask.setCharAt('2', position);
            position = editMask.setCharAt('3', position);

            position = editMask.setCharAt('4', position);
            position = editMask.setCharAt('5', position);
            position = editMask.setCharAt('6', position);

            position = editMask.setCharAt('7', position);
            position = editMask.setCharAt('8', position);

            position = editMask.setCharAt('9', position);
            position = editMask.setCharAt('0', position);

            //Then
            assert.equal(position, 17);
            assert.equal(editMask.getValue(), '1234567890');
        });

        it('successful getRegExpForMask with maskSaveLiteral', function () {
            //Given
            var editMask = new TemplateEditMask();
            editMask.mask = '+7 (999)000-00-00';
            editMask.maskSaveLiteral = true;

            //When
            var regexp = editMask.getRegExpForMask();

            //Then
            assert.isTrue(regexp.test('+7 (123)456-78-91'));
            assert.isTrue(regexp.test('+7 ()456-78-91'));
            assert.isTrue(regexp.test('+7 (1)456-78-91'));
            assert.isFalse(regexp.test('+7 (123)456-78-9'));
        });


        it('successful getRegExpForMask without maskSaveLiteral', function () {
            //Given
            var editMask = new TemplateEditMask();
            editMask.mask = '+7 (999)000-00-00';
            editMask.maskSaveLiteral = false;

            //When
            var regexp = editMask.getRegExpForMask();

            //Then
            assert.isTrue(regexp.test('1234567891'));
            assert.isTrue(regexp.test('1234567'));
            assert.isFalse(regexp.test('123456'));
        });

        it('successful set value without maskSaveLiteral', function () {
            //Given
            var editMask = new TemplateEditMask();
            editMask.mask = '+7 (999)000-00-00';
            editMask.maskSaveLiteral = false;

            //When
            editMask.reset('1234567890');

            //Then
            assert.equal(editMask.getValue(), '1234567890');
            assert.equal(editMask.getText(), '+7 (123)456-78-90');
        });

        it('successful set value with maskSaveLiteral', function () {
            //Given
            var editMask = new TemplateEditMask();
            editMask.mask = '+7 (999)000-00-00';
            editMask.maskSaveLiteral = true;

            //When
            editMask.reset('+7 (123)456-78-90');

            //Then
            assert.equal(editMask.getValue(), '+7 (123)456-78-90');
            assert.equal(editMask.getText(), '+7 (123)456-78-90');
        });

        it('successful format special chars', function () {
            //Given
            var editMask = new TemplateEditMask();
            editMask.mask = '00/00/0000 \\at 99:99 99% (99$)';

            //When
            editMask.reset();

            //Then
            assert.equal(editMask.getText(), '__.__.____ at __:__ __% (__р.)');
        });

    });

    describe('template mask', function () {
        var editMask;
        var chars;
        var char;
        var position;


        beforeEach(function () {
            chars = '@@55ЦЦ+-'.split('');
            editMask = new TemplateEditMask();
            editMask.maskSaveLiteral = false;
            position = 0;
        });

        it('successful input mask "c"', function () {
            //Given
            editMask.mask = Array(chars.length + 1).join('c');
            editMask.reset();

            //When
            position = editMask.moveToPrevChar(0);
            do {
                char = chars.shift();
                position = editMask.setCharAt(char, position);
            } while (chars.length > 0);

            var position = editMask.moveToPrevChar(0);

            //Then
            assert.equal(editMask.getValue(), '@@55ЦЦ+-');
        });

        it('successful input mask "C"', function () {
            //Given
            editMask.mask = Array(chars.length + 1).join('C');
            editMask.reset();

            //When
            position = editMask.moveToPrevChar(0);
            do {
                char = chars.shift();
                position = editMask.setCharAt(char, position);
            } while (chars.length > 0);

            var position = editMask.moveToPrevChar(0);

            //Then
            assert.equal(editMask.getValue(), '@@55ЦЦ+-');
        });

        it('successful input mask "l"', function () {
            //Given
            editMask.mask = Array(chars.length + 1).join('l');
            editMask.reset();

            //When
            position = editMask.moveToPrevChar(0);
            do {
                char = chars.shift();
                position = editMask.setCharAt(char, position);
            } while (chars.length > 0);

            var position = editMask.moveToPrevChar(0);

            //Then
            assert.equal(editMask.getValue(), 'ЦЦ');
        });

        it('successful input mask "L"', function () {
            //Given
            editMask.mask = Array(chars.length + 1).join('l');
            editMask.reset();

            //When
            position = editMask.moveToPrevChar(0);
            do {
                char = chars.shift();
                position = editMask.setCharAt(char, position);
            } while (chars.length > 0);

            var position = editMask.moveToPrevChar(0);

            //Then
            assert.equal(editMask.getValue(), 'ЦЦ');
        });

        it('successful input mask "a"', function () {
            //Given
            editMask.mask = Array(chars.length + 1).join('a');
            editMask.reset();

            //When
            position = editMask.moveToPrevChar(0);
            do {
                char = chars.shift();
                position = editMask.setCharAt(char, position);
            } while (chars.length > 0);

            var position = editMask.moveToPrevChar(0);

            //Then
            assert.equal(editMask.getValue(), '55ЦЦ');//@@55ЦЦ+-
        });

        it('successful input mask "A"', function () {
            //Given
            editMask.mask = Array(chars.length + 1).join('A');
            editMask.reset();

            //When
            position = editMask.moveToPrevChar(0);
            do {
                char = chars.shift();
                position = editMask.setCharAt(char, position);
            } while (chars.length > 0);

            var position = editMask.moveToPrevChar(0);

            //Then
            assert.equal(editMask.getValue(), '55ЦЦ');//@@55ЦЦ+-
        });

        it('successful input mask "#"', function () {
            //Given
            editMask.mask = Array(chars.length + 1).join('#');
            editMask.reset();

            //When
            position = editMask.moveToPrevChar(0);
            do {
                char = chars.shift();
                position = editMask.setCharAt(char, position);
            } while (chars.length > 0);

            var position = editMask.moveToPrevChar(0);

            //Then
            assert.equal(editMask.getValue(), '+-');//@@55ЦЦ+-
        });

        it('successful input mask "#"', function () {
            //Given
            editMask.mask = Array(chars.length + 1).join('#');
            editMask.reset();

            //When
            position = editMask.moveToPrevChar(0);
            do {
                char = chars.shift();
                position = editMask.setCharAt(char, position);
            } while (chars.length > 0);

            var position = editMask.moveToPrevChar(0);

            //Then
            assert.equal(editMask.getValue(), '+-');//@@55ЦЦ+-
        });

        it('successful input mask "9"', function () {
            //Given
            editMask.mask = Array(chars.length + 1).join('9');
            editMask.reset();

            //When
            position = editMask.moveToPrevChar(0);
            do {
                char = chars.shift();
                position = editMask.setCharAt(char, position);
            } while (chars.length > 0);

            var position = editMask.moveToPrevChar(0);

            //Then
            assert.equal(editMask.getValue(), '55');//@@55ЦЦ+-
        });

        it('successful input mask "0"', function () {
            //Given
            editMask.mask = Array(chars.length + 1).join('0');
            editMask.reset();

            //When
            position = editMask.moveToPrevChar(0);
            do {
                char = chars.shift();
                position = editMask.setCharAt(char, position);
            } while (chars.length > 0);

            var position = editMask.moveToPrevChar(0);

            //Then
            assert.equal(editMask.getValue(), '55');//@@55ЦЦ+-
        });
    });



});
describe('Button', function () {
    describe('render', function () {
        it('should create', function () {
            // Given
            var button = new Button();

            // When
            var $el = button.render();

            // Then
            assert.equal($el.find('button').length, 1);
        });

        it('should set enabled', function () {
            // Given
            var button = new Button();
            button.setText('button');
            var $el = button.render();

            assert.equal(button.getEnabled(), true);
            // When
            button.setEnabled(false);

            // Then
            assert.equal(button.getEnabled(), false);
        });

        it('should set text', function () {
            // Given
            var button = new Button();
            button.setText('button');
            var $el = button.render();

            // When
            button.setText('other button');

            // Then
            assert.equal($el.find('.btntext').text(), 'other button');
        });


        it('should set and get action', function () {
            // Given
            var button = new Button();

            assert.isNull(button.getAction());

            // When
            button.render();
            button.setAction(new OpenViewActionBuilder().build());

            // Then
            assert.isNotNull(button.getAction());
        });

        it('should execute action on click', function () {
            // Given
            var button = new Button(),
                onLastActionExecute = 0,
                onNewActionExecute = 0;

            button.setAction(new function(){
                this.execute = function () {
                    onLastActionExecute++;
                };
            });

            button.setAction(new function(){
                this.execute = function () {
                    onNewActionExecute++;
                };
            });

            assert.equal(onLastActionExecute, 0);
            assert.equal(onNewActionExecute, 0);

            // When
            button.render();
            button.click();

            // Then
            assert.equal(onLastActionExecute, 0);
            assert.equal(onNewActionExecute, 1);
        });

        it('event onClick', function () {
            // Given
            var button = new Button(),
                onClickFlag = 0;

            button.onClick(function(){
                    onClickFlag++;
            });

            assert.equal(onClickFlag, 0);

            // When
            button.render();
            button.click();

            // Then
            assert.equal(onClickFlag, 1);
        });

        it('should be true if scriptsHandlers call', function () {
            //Given
            var view = new View();
            view.setScripts([{Name:"OnClick", Body:"window.Test.button = 5"}, {Name: 'OnLoaded', Body:"window.Test.buttonLoaded = true"}]);

            var button = new ButtonBuilder();
            var metadata = {
                OnClick:{
                    Name: 'OnClick'
                },
                OnLoaded:{
                    Name: 'OnLoaded'
                }
            };
            window.Test = {button:1, buttonLoaded: false};

            //When
            var build = button.build(button, view, metadata);
            var $button = $(build.render());
            $button.find('button').click();

            // Then
            assert.equal(window.Test.button, 5);
            assert.isTrue(window.Test.buttonLoaded);
        });
    });
});

describe('ButtonBuilder', function () {
    describe('build', function () {
        it('successful build', function () {
            // Given

            var metadata = {
                Text: "Click me",
                Visible: false,
                HorizontalAlignment: 'Right',
                Action: {
                    OpenViewAction: {
                        View: {
                            InlineView: {
                                "ConfigId": "Structure",
                                "DocumentId": "Department",
                                "ViewType": "EditView"
                            }
                        }
                    }
                }
            };

            // When
            var builder = new ButtonBuilder();
            var button = builder.build(new ApplicationBuilder(), null, metadata);

            // Then
            assert.isNotNull(button);
            assert.equal(button.getText(), 'Click me');
            assert.isFalse(button.getVisible());
            assert.equal(button.getHorizontalAlignment(), 'Right');
            assert.isNotNull(button.getAction());
        });

        it('should pass parentView for builder', function () {
            //Given
            var builder = new ButtonBuilder(),
                applicationBuilder = {
                    build: function (parentView, metadata) {
                        //Then
                        assert.equal(parentView, 42);
                    }
                },
                parentView = 42,
                metadata = { Action: 23 };

            //When
            builder.build(applicationBuilder, parentView, metadata);
        });
    });
});

describe('PopupButton', function () {
    describe('api', function () {
        it('should create', function () {
            // Given
            var button = new PopupButton();

            // When
            var $el = button.render();

            // Then
            assert.equal($el.find('.pl-popup-btn-main').length, 1);
        });

        it('should set text', function () {
            // Given
            var button = new PopupButton();
            button.setText('button');
            var $el = button.render();

            // When
            button.setText('other button');

            // Then
            assert.equal($el.find('.pl-popup-btn-main').text(), 'other button');
            //window.
        });


        it('should set and get action', function () {
            // Given
            var button = new PopupButton();

            assert.isTrue(typeof button.getAction() === 'undefined');

            // When
            button.render();
            button.setAction(new OpenViewActionBuilder().build());

            // Then
            assert.isTrue(typeof button.getAction() !== 'undefined' && button.getAction() !== null);
        });

        it('should execute action on click', function (done) {
            // Given
            var button = new PopupButton(),
                onLastActionExecute = 0,
                onNewActionExecute = 0;

            button.setAction(new function(){
                this.execute = function () {
                    onLastActionExecute++;
                };
            });

            button.setAction(new function(){
                this.execute = function () {
                    onNewActionExecute++;
                    assert.equal(onLastActionExecute, 0);
                    assert.equal(onNewActionExecute, 1);
                    done();
                };
            });

            assert.equal(onLastActionExecute, 0);
            assert.equal(onNewActionExecute, 0);

            // When
            button.render();
            button.click();

            // Then

        });

        it('event onClick', function () {
            // Given
            var button = new PopupButton(),
                onClickFlag = 0;

            button.onClick(function(){
                    onClickFlag++;
            });

            assert.equal(onClickFlag, 0);

            // When
            button.render();
            button.click();

            // Then
            assert.equal(onClickFlag, 1);
        });

        it('should save click handler after set new action', function () {
            // Given
            var button = new PopupButton(),
                onClickFlag = 0;

            button.onClick(function(){
                onClickFlag++;
            });

            assert.equal(onClickFlag, 0);

            // When
            button.render();
            button.click();

            var action = new BaseAction();
            var execActionFlag=0;
            action.execute = function(){
                execActionFlag++;
            };

            button.setAction(action);

            button.click();
            // Then
            assert.equal(execActionFlag, 1);
            assert.equal(onClickFlag, 2);

        });

        it('should add items', function () {
            // Given
            var button = new PopupButton();

            // When
            button.addItem(new Button());
            button.addItem(new Button());

            // Then
            assert.equal(2,button.getItems().length);
        });

        it('should remove item', function () {
            // Given
            var button = new PopupButton();
            var b1 = new Button();
            var b2 = new Button();
            button.addItem(b1);
            button.addItem(b2);

            // When
            button.removeItem(b1);

            // Then
            assert.equal(1,button.getItems().length);
        });

        it('should return item by name', function () {
            // Given
            var button = new PopupButton();
            var b1 = new Button();
            b1.setName("button1");
            var b2 = new Button();
            b2.setName("button2");
            button.addItem(b1);
            button.addItem(b2);

            // Then
            assert.equal(b1, button.getItem("button1"));
        });

        it('should return null item by not existent name', function () {
            // Given
            var button = new PopupButton();

            // Then
            assert.isNull(button.getItem("button1"));
        });

//        it('should be true if scriptsHandlers call', function () {
//            //Given
//            var popupButton = new PopupButtonBuilder();
//            var view = new View();
//            var metadata = {
//                OnClick:{
//                    Name: 'OnClick'
//                }
//            };
//            window.Test = {popupButton:1};
//            view.setScripts([{Name:"OnClick", Body:"window.Test.popupButton = 5"}]);
//
//            //When
//            var build = popupButton.build(popupButton, view, metadata);
//            $(build.render()).find('.pl-popup-btn-main').trigger('click');
//
//            // Then
//            assert.equal(window.Test.popupButton, 5);
//        });
    });
});

describe('PopupButtonBuilder', function () {
    describe('build', function () {
        it('successful build', function () {
            // Given

            var metadata = {
                Text: "Click me",
                Action: {
                    OpenViewAction: {
                        View: {
                            InlineView: {
                                "ConfigId": "Structure",
                                "DocumentId": "Department",
                                "ViewType": "EditView"
                            }
                        }
                    }
                },
                OnClick:{
                    Name:"A"
                },
                Items: [
                    {
                        Button: {
                            Text: "Click me",
                            Visible: true,
                            HorizontalAlignment: 'Left',
                            Action: {

                            }
                        }
                    },
                    {
                        Button: {
                            Text: "Административная информация",
                            Visible: true,
                            Action: {

                            }
                        }
                    }
                ]

            };

            // When
            var builder = new PopupButtonBuilder();
            var button = builder.build(new ApplicationBuilder(), null, metadata);
            // Then
            assert.isNotNull(button);
            assert.equal(button.getText(), 'Click me');
            assert.isNotNull(button.getAction());
            assert.equal(2,button.getItems().length);

            assert.isTrue(button.getItems()[0] instanceof Button)
            assert.isTrue(button.getItems()[1] instanceof Button)
        });
    });
});

describe('CheckBoxBuilder', function () {
    describe('build', function () {
        it('successful build CheckBox', function () {
            // Given
            var checkBoxMetadata = {
                Visible: false,
                HorizontalAlignment: 'Center',

                Text: 'CheckBox'
            };

            var view = fakeView({
                getDataSource: function () {
                    return null;
                }
            });

            // When
            var builder = new CheckBoxBuilder();
            var checkBox = builder.build(new ApplicationBuilder(), view, checkBoxMetadata);

            // Then
            assert.isNotNull(checkBox);

            assert.isFalse(checkBox.getVisible(), 'Неверное значение для свойства Visible');
            assert.equal(checkBox.getHorizontalAlignment(), 'Center');

            assert.equal(checkBox.getText(), 'CheckBox');

            assert.isNotNull(checkBox.getValue());
        });
    });
});

describe('CheckBox', function () {
    describe('render', function () {

        it('should be checked after setValue', function () {
            // Given
            var checkBox = new CheckBox();

            var $el = checkBox.render();
            assert.isFalse($el.find('input').prop('checked'), 'Property checked for input');
            assert.equal($el.attr('data-pl-name'), undefined);

            // When
            checkBox.setValue(true);
            checkBox.setName('newName');

            // Then
            assert.isTrue($el.find('input').prop('checked'), 'Property checked for input');
            assert.equal($el.attr('data-pl-name'), 'newName');
        });

        it('should return boolean value', function () {
            //Given
            var checkBox = new CheckBox();
            assert.isFalse(checkBox.getValue(), 'Value');

            // When
            checkBox.setValue(true);
            checkBox.setName('newName');

            // Then
            assert.isTrue(checkBox.getValue(), 'Value');
        });

        it('should to forbid setting value if Enabled false', function () {
            //Given
            var checkBox = new CheckBox();
            var $view = checkBox.render();

            $('body').append($view);
            $view.find('input[type = checkbox]').click();
            assert.isTrue(checkBox.getValue());

            // When
            checkBox.setEnabled(false);
            $view.find('input[type = checkbox]').click();

            // Then
            assert.isTrue(!checkBox.getEnabled(), 'Enabled');
            assert.isTrue(checkBox.getValue(), 'Value');
        });

        it('should be true if scriptsHandlers call', function () {
            //Given
            var checkBox = new CheckBoxBuilder();
            var view = new View();
            var metadata = {
                OnValueChanged:{
                    Name: 'OnValueChanged'
                },
                OnLoaded:{
                    Name: 'OnLoaded'
                }
            };
            window.Test = {checkBox:1, checkBoxLoaded: false};
            view.setScripts([{Name:"OnValueChanged", Body:"window.Test.checkBox = 5"}, {Name:"OnLoaded", Body:"window.Test.checkBoxLoaded = true"}]);

            //When
            var build = checkBox.build(checkBox, view, metadata);
            $(build.render());
            build.setValue(true);

            // Then
            assert.equal(window.Test.checkBox, 5);
            assert.isTrue(window.Test.checkBoxLoaded);
        });
    });
});
describe('ComboBox', function () {
    describe('render', function () {

        it('Setting the properties: value, name, enabled, visible, horizontalAlignment', function () {
            // Given
            var comboBox = new ComboBox(), $el, $control;

            $el = comboBox.render();

            assert.isUndefined($el.attr('data-pl-name'));
            assert.isFalse($el.hasClass('hidden'), 'hidden');
            assert.isFalse($el.hasClass('pull-left'), 'pull-left');

            // When
            comboBox.setName('newName');
            comboBox.setEnabled(false);
            comboBox.setVisible(false);
            
            // Then

            assert.equal($el.attr('data-pl-name'), 'newName');

            assert.isTrue($el.hasClass('hidden'));
            assert.isFalse($el.hasClass('pull-left'));
        });

        it('Events onLoad, onValueChanged', function () {
            // Given
            var comboBox = new ComboBox(),
                onLoadFlag = 0,
                onValueChanged = 0;

            comboBox.onLoaded(function(){
                onLoadFlag++;
            });
            comboBox.onValueChanged(function(){
                onValueChanged++;
            });

            assert.equal(onLoadFlag, 0);
            assert.equal(onValueChanged, 0);

            // When
            comboBox.render();
            comboBox.setValue('new');

            // Then
            assert.equal(onLoadFlag, 1);
            assert.equal(onValueChanged, 1);
        });

        //TODO: когда починят comboBox
//        it('should be true if scriptsHandlers call', function () {
//            //Given
//            var comboBox = new ComboBoxBuilder();
//            var view = new View();
//            var metadata = {
//                OnValueChanged:{
//                    Name: 'OnValueChanged'
//                },
//                OnLoaded:{
//                    Name: 'OnLoaded'
//                }
//            };
//            window.Test = {comboBox:1, comboBoxLoaded: false};
//            view.setScripts([{Name:"OnValueChanged", Body:"window.Test.comboBox = 5"}, {Name:"OnLoaded", Body:"window.Test.comboBoxLoaded = true"}]);
//
//            //When
//            var build = comboBox.build(comboBox, view, metadata);
//            build.setValue(true);
//            $(build.render());
//
//            // Then
//            assert.equal(window.Test.comboBox, 5);
//            assert.isTrue(window.Test.comboBoxLoaded);
//        });
    });

    describe('ComboBoxSingleSelectStrategy', function () {

        it('Successful build selected from value', function () {
            // Given
            var strategy = new ComboBoxSingleSelectStrategy();

            // When
            var value = {Id: 1, DisplayName: 'One'};
            var id = strategy.buildSelectedFromValue(value);

            // Then
            assert.equal(id, value.Id);
        });

        it('Successful build value from selected', function () {
            // Given
            var strategy = new ComboBoxSingleSelectStrategy();

            // When
            var selected = "1";
            var list = [{id: 1, text: 'One'}, {id: 2, text: 'Two'}];

            var value = strategy.buildValueFromSelected(selected, list);
            // Then
            assert.deepEqual(value, {Id: 1, DisplayName: 'One'});
        });

        it('Successful build value from empty selected', function () {
            // Given
            var strategy = new ComboBoxSingleSelectStrategy();

            // When
            var selected = "";
            var list = [{id: 1, text: 'One'}, {id: 2, text: 'Two'}];

            var value = strategy.buildValueFromSelected(selected, list);
            // Then
            assert.isNull(value);
        });


        it('Successful build selection', function () {
            // Given
            var strategy = new ComboBoxSingleSelectStrategy();

            // When
            var selected = "1";
            var value = {Id: 1, DisplayName: 'One'};
            var list = [{id: 1, text: 'One'}, {id: 2, text: 'Two'}];

            var selection = strategy.buildSelection(selected, value, list);
            // Then
            assert.deepEqual(selection, {id: 1, text: 'One'});
        });

        it('Successful build selection for empty selected', function () {
            // Given
            var strategy = new ComboBoxSingleSelectStrategy();

            // When
            var selected = "";
            var value = {Id: 1, DisplayName: 'One'};
            var list = [{id: 1, text: 'One'}, {id: 2, text: 'Two'}];

            var selection = strategy.buildSelection(selected, value, list);
            // Then
            assert.deepEqual(selection, null);
        });

        it('Successful build selection when value not in list', function () {
            // Given
            var strategy = new ComboBoxSingleSelectStrategy();

            // When
            var selected = "99";
            var value = {Id: 99, DisplayName: 'Value not in list'};
            var list = [{id: 1, text: 'One'}, {id: 2, text: 'Two'}];

            var selection = strategy.buildSelection(selected, value, list);
            // Then
            assert.deepEqual(selection, {id: 99, text: 'Value not in list'});
        });

    });

    describe('ComboBoxMultiSelectStrategy', function () {

        it('Successful build selected from value', function () {
            // Given
            var strategy = new ComboBoxMultiSelectStrategy();

            // When
            var value = [{Id: 1, DisplayName: 'One'}, {Id: 2, DisplayName: 'Two'}];
            var id = strategy.buildSelectedFromValue(value);

            // Then
            assert.deepEqual(id, [1,2]);
        });

        it('Successful build value from selected', function () {
            // Given
            var strategy = new ComboBoxMultiSelectStrategy();

            // When
            var selected = [1];
            var list = [{id: '1', text: 'One'}, {id: '2', text: 'Two'}];

            var value = strategy.buildValueFromSelected(selected, list);
            // Then
            assert.isArray(value);
            assert.lengthOf(value, 1);
            assert.equal(value[0].Id, '1');
            assert.equal(value[0].DisplayName, 'One');
        });

        it('Successful build value from empty selected', function () {
            // Given
            var strategy = new ComboBoxMultiSelectStrategy();

            // When
            var selected = "";
            var list = [{id: 1, text: 'One'}, {id: 2, text: 'Two'}];

            var value = strategy.buildValueFromSelected(selected, list);
            // Then
            assert.isArray(value);
            assert.lengthOf(value, 0);
        });


        it('Successful build selection', function () {
            // Given
            var strategy = new ComboBoxMultiSelectStrategy();

            // When
            var selected = ['1'];
            var value = {Id: 1, DisplayName: 'One'};
            var list = [{id: 1, text: 'One'}, {id: 2, text: 'Two'}];

            var selection = strategy.buildSelection(selected, value, list);
            // Then
            assert.isArray(selection);
            assert.lengthOf(selection, 1);
            assert.equal(selection[0].id, '1');
            assert.equal(selection[0].text, 'One');
        });

        it('Successful build selection for empty selected', function () {
            // Given
            var strategy = new ComboBoxMultiSelectStrategy();

            // When
            var selected = null;
            var value = [{Id: 1, DisplayName: 'One'}];
            var list = [{id: 1, text: 'One'}, {id: 2, text: 'Two'}];

            var selection = strategy.buildSelection(selected, value, list);
            // Then
            assert.isArray(selection);
            assert.lengthOf(selection, 0)
        });

        it('Successful build selection when value not in list', function () {
            // Given
            var strategy = new ComboBoxMultiSelectStrategy();

            // When
            var selected = ["99"];
            var value = [{Id: 99, DisplayName: 'Value not in list'}];
            var list = [{id: 1, text: 'One'}, {id: 2, text: 'Two'}];

            var selection = strategy.buildSelection(selected, value, list);
            // Then
            assert.deepEqual(selection, [{id: 99, text: 'Value not in list'}]);
        });

        it('Successful build complex selection ', function () {
            // Given
            var strategy = new ComboBoxMultiSelectStrategy();

            // When
            var selected = ["99", "2"];
            var value = [{Id: 99, DisplayName: 'Value not in list'}];
            var list = [{id: 1, text: 'One'}, {id: 2, text: 'Two'}];

            var selection = strategy.buildSelection(selected, value, list);
            // Then
            assert.deepEqual(selection, [{id: 99, text: 'Value not in list'}, {id: 2, text: 'Two'}]);
        });

    });
});

describe('DataNavigation', function () {
    it('should pass test default property', function () {
        // Given
        var dataNavigationBuilder = new DataNavigationBuilder();
        var view = new View();
        view.setGuid(guid());
        var metadata = {
            Enabled: true,
            PageNumber: 5,
            PageSize: 10,

            Name: "DataNavigation1",
            AvailablePageSizes: [ 20, 50, 100 ],
            DataSource: "PatientDataSource"
        };
        var dataNavigation = dataNavigationBuilder.build(dataNavigationBuilder, view, metadata);

        //When
        dataNavigation.setName('NewDataNavigation');

        //Then
        assert.equal(dataNavigation.getName(), 'NewDataNavigation');
        assert.isTrue(dataNavigation.getEnabled());
        assert.isTrue(dataNavigation.getVisible());
        assert.equal(dataNavigation.getHorizontalAlignment(), 'Stretch');
        assert.equal(dataNavigation.getPageNumber(), metadata.PageNumber);
        assert.equal(dataNavigation.getPageSize(), metadata.PageSize);
        assert.equal(dataNavigation.getDataSource(), metadata.DataSource);
    });

    it('should handlers messageBus, onSetPageSize, onSetPageNumber', function () {
        // Given
        var dataNavigationBuilder = new DataNavigationBuilder();
        var view = new View();
        view.setGuid(guid());
        var metadata = {
            PageNumber: 5,
            PageSize: 10,

            Name: "DataNavigation1",
            //AvailablePageSizes: [ 20, 50, 100 ],
            DataSource: "PatientDataSource"
        };


        var exchange = view.getExchange();
        var dataNavigation = dataNavigationBuilder.build(dataNavigationBuilder, view, metadata);

        //Then
        exchange.subscribe(messageTypes.onSetPageSize, function (messageBody) {
            assert.equal(messageBody.value, 123);
            assert.equal(messageBody.dataSource, metadata.DataSource);
        });

        exchange.subscribe(messageTypes.onSetPageNumber, function (messageBody) {
            assert.equal(messageBody.value, 10);
            assert.equal(messageBody.dataSource, metadata.DataSource);
        });

        // When
        dataNavigation.setPageSize(123);
        dataNavigation.setPageNumber(10);
    });

    it('should be true if scriptsHandlers call', function () {
        //Given
        var dataNavigation = new DataNavigationBuilder();
        var view = new View();
        view.setGuid(guid());
        var metadata = {
            OnSetPageSize:{
                Name: 'OnSetPageSize'
            },
            OnSetPageNumber:{
                Name: 'OnSetPageNumber'
            },
            OnLoaded:{
                Name: 'OnLoaded'
            }
        };
        window.Test = {dataNavigation:{ps: 1, pn: 1, loaded: false}};
        view.setScripts([{Name:"OnSetPageSize", Body:"window.Test.dataNavigation.ps = 50"},{Name:"OnSetPageNumber", Body:"window.Test.dataNavigation.pn = 3"}, {Name:"OnLoaded", Body:"window.Test.dataNavigation.loaded = true"}]);

        //When
        var build = dataNavigation.build(dataNavigation, view, metadata);
        build.setPageSize(1);
        build.setPageNumber(1);
        $(build.render());

        // Then
        assert.equal(window.Test.dataNavigation.ps, 50);
        assert.equal(window.Test.dataNavigation.pn, 3);
        assert.isTrue(window.Test.dataNavigation.loaded);
    });
});
describe('DatePicker', function () {
    describe('render', function () {
        it('correct convert from string to date and from date to string', function () {
            // Given
            var datePicker = new DatePicker();

            datePicker.render();

            // When
            datePicker.setMinDate('2014-01-01');
            datePicker.setMaxDate('2014-12-31');
            datePicker.setValue('2014-07-29');

            // Then
            assert.equal(InfinniUI.DateUtils.toISO8601(datePicker.getMinDate()).substr(0, 10), '2014-01-01');
            assert.equal(InfinniUI.DateUtils.toISO8601(datePicker.getMaxDate()).substr(0, 10), '2014-12-31');
            assert.equal(datePicker.getValue().substr(0, 10), '2014-07-29');
        });

        it('event OnValueChanged', function () {
            // Given
            var datePicker = new DatePicker(),
                onValueChangedFlag = 0;

            datePicker.render();

            datePicker.onValueChanged(function(){
                onValueChangedFlag++;
            });

            assert.equal(onValueChangedFlag, 0);

            // When
            datePicker.setValue('2014-07-29');
            datePicker.setValue('2014-07-30');

            // Then
            assert.equal(onValueChangedFlag, 2);
        });
    });
});


describe('DatePickerBuilder', function () {
    describe('build', function () {
        it('successful build Date', function () {
            // Given

            var datePickerMetadata = {
                Visible: false,
                HorizontalAlignment: 'Right',

                Mode: 'Date',
                MinDate: '2014-01-01',
                MaxDate: '2014-12-31'
                //Format: 'ShortDate'
            };

            // When
            var builder = new DatePickerBuilder();
            var datePicker = builder.build(new ApplicationBuilder(), new View(), datePickerMetadata);

            // Then
            assert.isNotNull(datePicker);

            assert.isFalse(datePicker.getVisible(), 'Неверное значение для свойства Visible');
            assert.equal(datePicker.getHorizontalAlignment(), 'Right');

            assert.equal(datePicker.getMode(), 'Date');

            assert.equal(InfinniUI.DateUtils.toISO8601(datePicker.getMinDate()).substr(0, 10), '2014-01-01');
            assert.equal(InfinniUI.DateUtils.toISO8601(datePicker.getMaxDate()).substr(0, 10), '2014-12-31');

            //assert.equal(datePicker.getFormat(), 'ShortDate');
        });

        it('set default value when not fill property', function () {
            // Given
            var datePickerMetadata = {
                Mode: 'Date'//,
                //Format: 'ShortDate'
            };

            // When
            var builder = new DatePickerBuilder();
            var datePicker = builder.build(new ApplicationBuilder(), new View(), datePickerMetadata);

            // Then
            assert.isNotNull(datePicker);

            assert.isNull(datePicker.getMinDate(), 'Неверное значение для свойства MinDate');
            assert.isNull(datePicker.getMaxDate(), 'Неверное значение для свойства MaxDate');
            assert.isNull(datePicker.getValue(), 'Неверное значение для свойства Value');

        });

        it('should be true if scriptsHandlers call', function () {
            //Given
            var datePicker = new DatePickerBuilder();
            var view = new View();
            var metadata = {
                OnValueChanged:{
                    Name: 'OnValueChanged'
                },
                OnLoaded:{
                    Name: 'OnLoaded'
                }
            };
            window.Test = {datePicker:1, datePickerLoaded: false};
            view.setScripts([{Name:"OnValueChanged", Body:"window.Test.datePicker = 5"}, {Name:"OnLoaded", Body:"window.Test.datePickerLoaded = true"}]);

            //When
            var build = datePicker.build(new ApplicationBuilder(), view, metadata);
            build.setValue(true);
            $(build.render());

            // Then
            assert.equal(window.Test.datePicker, 5);
            assert.isTrue(window.Test.datePickerLoaded);
        });
    });
});

describe('DocumentViewer', function () {
    it('should pass test default property', function () {
        // Given
        var documentViewerBuilder = new DocumentViewerBuilder();
        var view = new View();
        var metadata = {
            PrintViewId: "PrintView",
            PrintViewType: "ObjectView",
            DataSource: "MainDataSource"
        };
        var documentViewer = documentViewerBuilder.build(documentViewerBuilder, view, metadata);

        //When
        documentViewer.setName('DocumentViewer');

        //Then
        assert.equal(documentViewer.getName(), 'DocumentViewer');
        assert.equal(documentViewer.getPrintViewId(), 'PrintView');
        assert.equal(documentViewer.getPrintViewType(), 'ObjectView');
        assert.equal(documentViewer.getDataSource(), 'MainDataSource');
        assert.isTrue(documentViewer.getEnabled());
        assert.isTrue(documentViewer.getVisible());
        assert.equal(documentViewer.getHorizontalAlignment(), 'Stretch');
    });
    
    //it('should be true on load', function () {
    //    // Given
    //    var documentViewer = new DocumentViewer(),
    //        onLoadFlag = 0;
    //
    //    documentViewer.onLoaded(function(){
    //        onLoadFlag++;
    //        console.log(onLoadFlag);
    //    });
    //
    //    assert.equal(onLoadFlag, 0);
    //
    //    // When
    //    documentViewer.render();
    //
    //    // Then
    //    assert.equal(onLoadFlag, 1);
    //});
});
describe('FilterPanel', function () {
    it('should setting with default properties', function () {
        // Given
        var filterPanelBuilder = new FilterPanelBuilder();
        var builder = new Builder();
        var view = new View();
        var metadata = {
            Name: "FilterPanel1",
            DataSource: "PatientsDataSource"
        };
        var filterPanel = filterPanelBuilder.build(builder, view, metadata);

        //When
        filterPanel.setName('NewFilterPanel');
        filterPanel.setText('NewText');

        //Then
        assert.equal(filterPanel.getName(), 'NewFilterPanel');
        assert.isTrue(filterPanel.getEnabled());
        assert.equal(filterPanel.getHorizontalAlignment(), 'Stretch');
        assert.isTrue(filterPanel.getVisible());
        assert.equal(filterPanel.getText(), 'NewText');
    });

    it('should exchange (send, subscribe)', function (done) {
        // Given
        var builder = new ApplicationBuilder();
        var view = new View();
        view.setGuid(guid());
        var metadata = {
            FilterPanel: {
                Name: "FilterPanel1",
                DataSource: "PatientsDataSource",
                GeneralProperties: [
                    {
                        Text: "Имя",
                        Property: "FirstName",
                        DefaultOperator: "IsStartsWith",
                        Operators: [
                            {
                                Operator: "IsStartsWith",
                                Editor: {
                                    TextBox: {
                                        Name: "TextBox1",
                                        Value: {
                                            PropertyBinding: {
                                                DataSource: "PatientDataSource",
                                                Property: "FirstName"
                                            }
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        };
        var exchange = view.getExchange();

        var filterPanel = builder.build(view, metadata);
        var $filterPanel = filterPanel.render();

        // When
        exchange.subscribe(messageTypes.onSetPropertyFilters, function (messageBody) {
            // Then
            assert.equal(messageBody.value[0].CriteriaType, 1024);//IsStartsWith = 1024
            assert.equal(messageBody.dataSource, 'PatientsDataSource');
            done();
        });
        $filterPanel.find('input')
            .val('qq')
            .trigger('change');
        // вместо нативного вызова поиска, имитируем его, поскольку иначе мокка редиректит страницу, цука.
        filterPanel.control.controlView.submitFormHandler({
            preventDefault: $.noop
        });
    });

    it('should be true if scriptsHandlers call', function () {
        //Given
        var filterPanelBuilder = new FilterPanelBuilder();
        var view = new View();
        view.setGuid(guid());
        var metadata = {
            OnValueChanged:{
                Name: 'OnValueChanged'
            },
            OnLoaded:{
                Name: 'OnLoaded'
            }
        };
        window.Test = {filterPanel:1, filterPanelLoaded: false};
        view.setScripts([{Name:"OnValueChanged", Body:"window.Test.filterPanel = 5"}, {Name:"OnLoaded", Body:"window.Test.filterPanelLoaded = true"}]);

        //When
        var filterPanel = filterPanelBuilder.build(filterPanelBuilder, view, metadata);
        filterPanel.render();
        // вместо нативного вызова поиска, имитируем его, поскольку иначе мокка редиректит страницу, цука.
        filterPanel.control.controlView.submitFormHandler({
            preventDefault: $.noop
        });

        // Then
        assert.equal(window.Test.filterPanel, 5);
        assert.isTrue(window.Test.filterPanelLoaded);
    });
});
describe('GridPanelBuilder', function () {
    it('should build', function () {
        //Given
        var metadata = {
            "Rows": [
                {
                    "Cells": [
                        {
                            "ColumnSpan": 6,
                            "Items": [
                                {
                                    "Panel": {
                                        "Text": "Главное меню",
                                        "Name": "MainMenuPanel",
                                        "Items": [
                                            {
                                                "Button": {
                                                    "Name": "PatientsButton",
                                                    "Text": "Пациенты"
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        {
                            "ColumnSpan": 6,
                            "Items": [
                                {
                                    "Panel": {
                                        "Text": "Какой-нибудь виджет",
                                        "Name": "Widget1Panel",
                                        "Items": []
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    "Cells": [
                        {
                            "ColumnSpan": 12,
                            "Items": [
                                {
                                    "Panel": {
                                        "Text": "И тут еще виджет",
                                        "Name": "Widget2Panel",
                                        "Items": []
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        };

        var applicationBuilder = new Builder();
        applicationBuilder.register('Panel', { build: function () {
            return 42;
        }});

        //Then
        var gridPanel = new GridPanelBuilder().build(applicationBuilder, fakeView(), metadata);

        //When
        assert.equal(gridPanel.getRows().length, 2);
        assert.equal(gridPanel.getRows()[0].getCells().length, 2);
        assert.equal(gridPanel.getRows()[1].getCells().length, 1);
        assert.equal(gridPanel.getRows()[0].getCells()[0].getItems().length, 1);
    });
});
describe('ListBox', function () {
    describe('render', function () {
        it('should render listBox', function () {

            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            $('body').append($('<div>').attr('id', 'page-content'));

            var metadata = {
                Text: 'Пациенты',
                DataSources : [
                    {
                        DocumentDataSource: {
                            Name : "PatientDataSource",
                            ConfigId: 'Demography',
                            DocumentId: 'Patient',
                            IdProperty: 'Id',
                            CreateAction: 'CreateDocument',
                            GetAction: 'GetDocument',
                            UpdateAction: 'SetDocument',
                            DeleteAction: 'DeleteDocument',
                            FillCreatedItem: true
                        }
                    }
                ],
                LayoutPanel: {

                    StackPanel: {
                        Name: 'MainViewPanel',
                        Items: [
                            {
                                "ListBox": {
                                    "ItemTemplate": {
                                        "StackPanel": {
                                            "Items": [
                                                {
                                                    "TextBox": {
                                                        "Name": "TextBox1"
                                                    }
                                                }
                                            ]

                                        }
                                    },
                                    "Items" : {
                                        "PropertyBinding": {
                                            "DataSource": "PatientDataSource",
                                            "Property": ""
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            };

            var linkView = new LinkView(null, function (resultCallback) {
                var builder = new ApplicationBuilder();
                var view = builder.buildType(fakeView(), 'View', metadata);
                resultCallback(view);
            });
            linkView.setOpenMode('Application');

            var view = linkView.createView(function (view) {
                view.open();
            });
        });
    })
});
describe('NumericBox', function () {
    describe('render', function () {
        it('Setting the properties: value, name, enabled, visible, horizontalAlignment', function () {
            // Given
            var numericBox = new NumericBox(),
                $el, $control;

            // When
            $el = numericBox.render();
            $control = $el.find('input');

            // Then
            assert.equal($control.val(), 0);
            assert.isUndefined($el.attr('data-pl-name'));
            assert.isFalse($control.prop('disabled'));
            assert.isFalse($el.hasClass('hidden'));
            assert.isFalse($el.hasClass('pull-left'));
            assert.isFalse($el.hasClass('center-block'));
        });

        it('Change the properties: value, name, enabled, visible, horizontalAlignment', function () {
            // Given
            var numericBox = new NumericBox(),
                $el, $control;
            var numericBox1 = new NumericBox(),
                $el1, $control1;
            var numericBox2 = new NumericBox(),
                $el2, $control2;

            // When
            $el = numericBox.render();
            $control = $el.find('input');
            numericBox1.render();
            numericBox2.render();

            numericBox.setValue(15);
            numericBox.setMinValue(10);
            numericBox.setMaxValue(50);
            numericBox.setIncrement(5);
            numericBox.setName('newName');
            numericBox.setEnabled(false);
            numericBox.setVisible(false);
            numericBox.setHorizontalAlignment('Center');

            numericBox1.setMaxValue(20);
            numericBox1.setValue(50);
            numericBox2.setMinValue(20);
            numericBox2.setValue(5);

            // Then
            assert.equal(numericBox1.getValue(), 20);
            assert.equal(numericBox2.getValue(), 20);

            assert.equal(numericBox.getValue(), 15);
            assert.equal(numericBox.getMinValue(), 10);
            assert.equal(numericBox.getMaxValue(), 50);
            assert.equal(numericBox.getIncrement(), 5);
            assert.equal($el.attr('data-pl-name'), 'newName');
            assert.isTrue($control.prop('disabled'));
            assert.isTrue($el.hasClass('hidden'));
            assert.isFalse($el.hasClass('pull-left'));
            assert.isTrue($el.hasClass('center-block'));
        });

        it('Events onLoad, onValueChanged', function () {
            // Given
            var numericBox = new NumericBox(),
                onLoadFlag = 0,
                onValueChanged = 0;

            numericBox.onLoaded(function () {
                onLoadFlag++;
            });
            numericBox.onValueChanged(function () {
                onValueChanged++;
            });

            assert.equal(onLoadFlag, 0);
            assert.equal(onValueChanged, 0);

            // When
            numericBox.render();
            numericBox.setValue(1);

            // Then
            assert.equal(onLoadFlag, 1);
            assert.equal(onValueChanged, 1);
        });

        it('should be true if scriptsHandlers call', function () {
            //Given
            var builder = new ApplicationBuilder();
            var view = new View();
            var metadata = {
                "NumericBox": {
                    OnValueChanged:{
                        Name: 'OnValueChanged'
                    },
                    OnLoaded:{
                        Name: 'OnLoaded'
                    }
                }
            };
            window.Test = {numericBox:1, numericBoxLoaded: false};
            view.setScripts([{Name:"OnValueChanged", Body:"window.Test.numericBox = 5"}, {Name:"OnLoaded", Body:"window.Test.numericBoxLoaded = true"}]);

            //When
            //var build = numericBox.build(numericBox, view, metadata);
            var build = builder.build(view, metadata);
            build.setValue(true);
            $(build.render());

            // Then
            assert.equal(window.Test.numericBox, 5);
            assert.isTrue(window.Test.numericBoxLoaded);
        });
    });
});
describe('SearchPanel', function () {
    it('Setting the default properties', function () {
        // Given
        var searchPanelBuilder = new SearchPanelBuilder();
        var builder = new Builder();
        var view = new View();
        var metadata = {
            Name: "SearchPanel1",
            DataSource: "PatientsDataSource"
        };
        var searchPanel = searchPanelBuilder.build(builder, view, metadata);

        //When
        searchPanel.setName('NewSearchPanel');
        searchPanel.setText('NewText');

        //Then
        assert.equal(searchPanel.getName(), 'NewSearchPanel');
        assert.isTrue(searchPanel.getEnabled());
        assert.equal(searchPanel.getHorizontalAlignment(), 'Stretch');
        assert.isTrue(searchPanel.getVisible());
        assert.equal(searchPanel.getText(), 'NewText');
    });

    it('Events setValue, exchange event', function (done) {
        // Given
        var searchPanelBuilder = new SearchPanelBuilder();
        var builder = new Builder();
        var view = new View();
        view.setGuid(guid());
        var metadata = {
            Name: "SearchPanel1",
            DataSource: "PatientsDataSource"
        };
        var exchange = view.getExchange();

        var searchPanel = searchPanelBuilder.build(builder, view, metadata);
        var $searchPanel = searchPanel.render();
        exchange.subscribe(messageTypes.onSetTextFilter, onSetTextFilterHandler);

        // When
        searchPanel.setValue(123);
        // ������ ��������� ������ ������, ��������� ���, ��������� ����� ����� ���������� ��������, ����.
        searchPanel.control.controlView.submitFormHandler({
            preventDefault: $.noop
        });

        // Then
        function onSetTextFilterHandler(messageBody){
            assert.equal(messageBody.value, 123);
            assert.equal(messageBody.dataSource, 'PatientsDataSource');
            done();
        }
    });

    it('should be true if scriptsHandlers call', function () {
        //Given
        var searchPanelBuilder = new SearchPanelBuilder();
        var view = new View();
        view.setGuid(guid());
        var metadata = {
            OnValueChanged:{
                Name: 'OnValueChanged'
            },
            OnLoaded:{
                Name: 'OnLoaded'
            }
        };
        window.Test2 = {searchPanel:1, searchPanelLoaded: false};
        view.setScripts([{Name:"OnValueChanged", Body:"window.Test2.searchPanel = 5"}, {Name:"OnLoaded", Body:"window.Test2.searchPanelLoaded = true"}]);
        var searchPanel = searchPanelBuilder.build(searchPanelBuilder, view, metadata);

        //When
        searchPanel.render();
        // ������ ��������� ������ ������, ��������� ���, ��������� ����� ����� ���������� ��������, ����.
        searchPanel.control.controlView.submitFormHandler({
            preventDefault: $.noop
        });

        // Then
        assert.equal(window.Test2.searchPanel, 5);
        assert.isTrue(window.Test2.searchPanelLoaded);
    });
});
describe('TextBox', function () {
    describe('render', function () {

        it('Setting the properties: value, name, enabled, visible, horizontalAlignment', function () {
            // Given
            var textBox = new TextBox(),
                $el, $control;
            textBox.setValue('test');
            $el = textBox.render();
            $control = $el.find('input');

            assert.equal($control.val(), 'test');
            assert.isUndefined($el.attr('data-pl-name'));
            assert.isFalse($control.prop('disabled'));
            assert.isFalse($el.hasClass('hidden'));
            assert.isFalse($el.hasClass('pull-left'));

            // When
            textBox.setValue('new');
            textBox.setName('newName');
            textBox.setEnabled(false);
            textBox.setVisible(false);
            textBox.setHorizontalAlignment('Left');

            // Then
            assert.equal($control.val(), 'new');
            assert.equal($el.attr('data-pl-name'), 'newName');
            assert.isTrue($control.prop('disabled'));
            assert.isTrue($el.hasClass('hidden'));
            assert.isTrue($el.hasClass('pull-left'));
        });
        function testAlignment(element, alignment, cssClass){
            debugger
            if(!element.setHorizontalAlignment) return false;
            //debugger
            element.setHorizontalAlignment(alignment);

            if(alignment!== element.getHorizontalAlignment()) return false;
            if(!element.render().hasClass(cssClass)) return false;

            return true;
        }

        it('Events onLoad, onValueChanged', function () {
            // Given
            var textBox = new TextBox(),
                onLoadFlag = 0,
                onValueChanged = 0;

            textBox.onLoaded(function(){
                onLoadFlag++;
            });
            textBox.onValueChanged(function(){
                onValueChanged++;
            });

            assert.equal(onLoadFlag, 0);
            assert.equal(onValueChanged, 0);

            // When
            textBox.render();
            textBox.setValue('new');

            // Then
            assert.equal(onLoadFlag, 1);
            assert.equal(onValueChanged, 1);
        });

        it('should be true if scriptsHandlers call', function () {
            //Given
            var builder = new ApplicationBuilder();
            var view = new View();
            var metadata = {
                "TextBox": {
                    OnValueChanged:{
                        Name: 'OnValueChanged'
                    },
                    OnLoaded:{
                        Name: 'OnLoaded'
                    }
                }
            };
            window.Test = {textBox:1, textBoxLoaded:false};
            view.setScripts([{Name:"OnValueChanged", Body:"window.Test.textBox = 5"}, {Name:"OnLoaded", Body:"window.Test.textBoxLoaded = true"}]);

            //When
            var build = builder.build(view, metadata);
            build.setValue(true);
            $(build.render());

            // Then
            assert.equal(window.Test.textBox, 5);
            assert.isTrue(window.Test.textBoxLoaded);
        });
    });

    describe('TextBox data binding', function () {
        it('should set TextBox.text from property binding', function () {

            //это говнокод
            $('#page-content').empty();

            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            //$('body').append($('<div>').attr('id', 'page-content'));

            var metadata = {
                Text: 'Пациенты',
                DataSources: [
                    {
                        DocumentDataSource: {
                            Name : "PatientDataSource",
                            ConfigId: 'Demography',
                            DocumentId: 'Patient',
                            IdProperty: 'Id',
                            CreateAction: 'CreateDocument',
                            GetAction: 'GetDocument',
                            UpdateAction: 'SetDocument',
                            DeleteAction: 'DeleteDocument',
                            FillCreatedItem: true
                        }
                    }
                ],
                LayoutPanel: {
                    StackPanel: {
                        Name: 'MainViewPanel',
                        Items: [
                            {
                                TextBox: {
                                    Name: 'TextBox1',
                                    Value : {
                                        PropertyBinding : {
                                            DataSource : 'PatientDataSource',
                                            Property : '$.LastName'
                                        }
                                    },
                                    Multiline: false
                                }
                            }
                        ]
                    }
                }
            };

            var linkView = new LinkView(null, function (resultCallback) {
                var builder = new ApplicationBuilder();
                var view = builder.buildType(fakeView(), 'View', metadata);
                resultCallback(view);
            });
            linkView.setOpenMode('Application');

            linkView.createView(function(view){
                view.open();

                var itemToSelect = null;
                view.getDataSource('PatientDataSource').getItems(function(data){
                    itemToSelect = data[1];
                });

                view.getDataSource('PatientDataSource').setSelectedItem(itemToSelect);

                //check text
                assert.equal($('#sandbox').find('input:text').val(), itemToSelect.LastName);
                //$('#page-content').remove();
            });
        });
    });
});
describe('ToggleButton', function () {
    describe('render', function () {
        it('Setting the properties: value, name, enabled, visible, horizontalAlignment', function () {
            // Given
            var toggleButton = new ToggleButton(),
                $el, $control;

            // When
            $el = toggleButton.render();
            $control = $el.find('input');

            // Then
            assert.isTrue($control.prop('checked'));
            assert.isUndefined($el.attr('data-pl-name'));
            assert.isFalse($control.prop('disabled'));
            assert.isFalse($el.hasClass('hidden'));
            assert.isTrue($el.hasClass('pull-left'));
            assert.isFalse($el.hasClass('center-block'));
        });

        it('Change the properties: value, name, enabled, visible, horizontalAlignment', function () {
            // Given
            var toggleButton = new ToggleButton(),
                $el, $control;

            // When
            $el = toggleButton.render();
            $('body').prepend($el);
            $control = $el.find('input');
            toggleButton.setValue(false);
            toggleButton.setTextOn('ДА');
            toggleButton.setTextOff('НЕТ');

            toggleButton.setName('newName');
            toggleButton.setEnabled(false);
            toggleButton.setVisible(false);
            toggleButton.setHorizontalAlignment('Center');

            // Then
            assert.isTrue($el.prop('textContent').length == 6);
            assert.isFalse($control.prop('checked'));
            assert.equal($el.attr('data-pl-name'), 'newName');
            assert.isTrue($control.prop('disabled'));
            assert.isTrue($el.hasClass('hidden'));
            assert.isFalse($el.hasClass('pull-left'));
            assert.isTrue($el.hasClass('center-block'));
        });

        it('Events onLoad, onValueChanged', function () {
            // Given
            var toggleButton = new ToggleButton(),
                onLoadFlag = 0,
                onValueChanged = 0;

            toggleButton.onLoaded(function(){
                onLoadFlag++;
            });
            toggleButton.onValueChanged(function(){
                onValueChanged++;
            });

            assert.equal(onLoadFlag, 0);
            assert.equal(onValueChanged, 0);

            // When
            toggleButton.render();
            toggleButton.setValue('true');

            // Then
            assert.equal(onLoadFlag, 1);
            assert.equal(onValueChanged, 1);
        });

        it('should be true if scriptsHandlers call', function () {
            //Given
            var toggleButton = new ToggleButtonBuilder();
            var view = new View();
            var metadata = {
                OnValueChanged:{
                    Name: 'OnValueChanged'
                },
                OnLoaded:{
                    Name: 'OnLoaded'
                }
            };
            window.Test = {toggleButton:1, toggleButtonLoaded:false};
            view.setScripts([{Name:"OnValueChanged", Body:"window.Test.toggleButton = 5"}, {Name:"OnLoaded", Body:"window.Test.toggleButtonLoaded = true"}]);

            //When
            var build = toggleButton.build(toggleButton, view, metadata);
            build.setValue(false);
            $(build.render());

            // Then
            assert.equal(window.Test.toggleButton, 5);
            assert.isTrue(window.Test.toggleButtonLoaded);
        });
    });
});
describe('UploadFileBox', function () {
    describe('UploadFileBox', function () {

        var element;

        beforeEach (function () {
            element = new UploadFileBox();
        });

        it('Default property value', function () {
            // Given

            //$('body').append(element.render());
            assert.strictEqual(element.getReadOnly(), false);
            assert.strictEqual(element.getMaxSize(), 0);

        });

        it('Setting properties', function () {

            // Given
            element.setReadOnly(true);
            element.setAcceptTypes(['video/*']);
            element.setMaxSize(50000);
            element.setValue({Info: {}});

            assert.equal(element.getReadOnly(), true);
            assert.deepEqual(element.getAcceptTypes(), ['video/*']);
            assert.deepEqual(element.getValue(), {Info: {}});
            assert.equal(element.getMaxSize(), 50000);
        });

    });


    describe('UploadFileBox data binding', function () {
        it('should set UploadFileBox.value from property binding', function () {

            //это говнокод
            $('#page-content').empty();

            window.providerRegister.register('UploadDocumentDataSource', function (metadataValue) {
                return new DataProviderUpload(new QueryConstructorUpload('http://127.0.0.1:8888', metadataValue));
            });

            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            $('body').append($('<div>').attr('id', 'page-content'));

            var metadata = {
                Text: 'Пациенты',
                DataSources: [
                    {
                        DocumentDataSource: {
                            Name : "PatientDataSource",
                            ConfigId: 'Demography',
                            DocumentId: 'Patient',
                            IdProperty: 'Id',
                            CreateAction: 'CreateDocument',
                            GetAction: 'GetDocument',
                            UpdateAction: 'SetDocument',
                            DeleteAction: 'DeleteDocument',
                            FillCreatedItem: true
                        }
                    }
                ],
                LayoutPanel: {
                    StackPanel: {
                        Name: 'MainViewPanel',
                        Items: [
                            {
                                UploadFileBox: {
                                    Name: 'UploadFileBox1',
                                    AcceptTypes: ['image/*', 'video/*'],
                                    MaxSize: 100000,
                                    Value : {
                                        FileBinding : {
                                            DataSource : 'PatientDataSource',
                                            Property : '$.file'
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            };

            var linkView = new LinkView(null, function (resultCallback) {
                var builder = new ApplicationBuilder();
                var view = builder.buildType(fakeView(), 'View', metadata);
                resultCallback(view);
            });
            linkView.setOpenMode('Application');

            linkView.createView(function(view){
                view.open();

                var itemToSelect = null;
                view.getDataSource('PatientDataSource').getItems(function(data){
                    itemToSelect = data[1];
                });

                view.getDataSource('PatientDataSource').setSelectedItem(itemToSelect);


                //window.maindatasource = view.getDataSource('PatientDataSource');

                //check text
                // assert.equal($('#page-content').find('input:text').val(), itemToSelect.LastName);
                // $('#page-content').remove();
            });
        });
    });


});
describe('ImageBox', function () {
    describe('Render', function () {
        var element;

        beforeEach (function () {
            element = new ImageBox();
        });

        it('Default property value', function () {
            // Given

            //$('body').append(element.render());
            assert.strictEqual(element.getReadOnly(), false);
            assert.strictEqual(element.getMaxSize(), 0);

        });

        it('Setting properties', function () {

            // Given
            element.setReadOnly(true);
            element.setAcceptTypes(['video/*']);
            element.setMaxSize(50000);
            element.setValue({Info: {}});

            assert.equal(element.getReadOnly(), true);
            assert.deepEqual(element.getAcceptTypes(), ['video/*']);
            assert.deepEqual(element.getValue(), {Info: {}});
            assert.equal(element.getMaxSize(), 50000);
        });

    });


    describe('ImageBox data binding', function () {
        it('should set ImageBox.value from property binding', function () {

            //это говнокод
            $('#page-content').empty();

            window.providerRegister.register('UploadDocumentDataSource', function (metadataValue) {
                return new DataProviderUpload(new QueryConstructorUpload('http://127.0.0.1:8888', metadataValue));
            });

            window.providerRegister.register('DocumentDataSource', function () {
                return new FakeDataProvider();
            });

            $('body').append($('<div>').attr('id', 'page-content'));

            var metadata = {
                Text: 'Пациенты',
                DataSources: [
                    {
                        DocumentDataSource: {
                            Name : "PatientDataSource",
                            ConfigId: 'Demography',
                            DocumentId: 'Patient',
                            IdProperty: 'Id',
                            CreateAction: 'CreateDocument',
                            GetAction: 'GetDocument',
                            UpdateAction: 'SetDocument',
                            DeleteAction: 'DeleteDocument',
                            FillCreatedItem: true
                        }
                    }
                ],
                LayoutPanel: {
                    StackPanel: {
                        Name: 'MainViewPanel',
                        Items: [
                            {
                                ImageBox: {
                                    Name: 'ImageBox1',
                                    Value : {
                                        FileBinding : {
                                            DataSource : 'PatientDataSource',
                                            Property : '$.photo'
                                        }
                                    }
                                }
                            }
                        ]
                    }
                }
            };

            var linkView = new LinkView(null, function (resultCallback) {
                var builder = new ApplicationBuilder();
                var view = builder.buildType(fakeView(), 'View', metadata);
                resultCallback(view);
            });
            linkView.setOpenMode('Application');

            linkView.createView(function(view){
                view.open();

                var itemToSelect = null;
                view.getDataSource('PatientDataSource').getItems(function(data){
                    itemToSelect = data[1];
                });

                view.getDataSource('PatientDataSource').setSelectedItem(itemToSelect);


                window.maindatasource = view.getDataSource('PatientDataSource');

                //check text
               // assert.equal($('#page-content').find('input:text').val(), itemToSelect.LastName);
               // $('#page-content').remove();
            });
        });
    });


});
//describe('Extension Panel', function () {
//    it('should be true if scriptsHandlers call', function () {
//        //Given
//        var extensionPanel = new ApplicationBuilder();
//        var view = new View();
//        var metadata = {
//            ExtensionPanel: {
//                ExtensionName: 'Banner',
//                OnLoaded: {
//                    Name: 'OnLoaded'
//                }
//            }
//        };
//        window.Test = {extensionPanelLoaded:false};
//        view.setScripts([{Name:"OnLoaded", Body:"window.Test.extensionPanelLoaded = true"}]);
//
//        //When
//        var build = extensionPanel.build(view, metadata);
//        var el = build.render();
//
//        // Then
////        assert.isTrue(window.Test.extensionPanelLoaded);
//    });
//});
describe('PanelBuilder', function () {
    it('should build', function () {

        //Given
        var metadata = {
            Panel: {
                Text: 'panel',
                Items: [
                    {
                        TextBox: {
                            Name: 'text'
                        }
                    }
                ]
            }
        };

        var applicationBuilder = new ApplicationBuilder();

        //Then
        var panel = applicationBuilder.build(applicationBuilder, metadata);

        //When
        assert.equal(panel.getText(), 'panel');
    });

    it('should be true if scriptsHandlers call', function () {
        //Given
        var builder = new Builder();
        var panel = new PanelBuilder();
        var view = new View();
        var metadata = {
            Text: 'panel',
            Collapsible: true,
            Items: [
                {
                    TextBox: {
                        Name: 'text'
                    }
                }
            ],
            OnLoaded: {
                Name: 'OnLoaded'
            },

            OnExpanded: {
                Name: 'OnExpanded'
            },

            OnCollapsed: {
                Name: 'OnCollapsed'
            }
        };
        window.Test = {panelLoaded: false, panelCollapsed: false, panelExpanded: false };
        view.setScripts([
            {Name: "OnLoaded", Body: "window.Test.panelLoaded = true"},
            {Name: "OnExpanded", Body: "window.Test.panelExpanded = true"},
            {Name: "OnCollapsed", Body: "window.Test.panelCollapsed = true"}
        ]);

        //When
        var build = panel.build(builder, view, metadata);
        var $el = $(build.render());
        $el.find('.collapse').trigger('click');
        $el.find('.expand').trigger('click');


        // Then
        assert.isTrue(window.Test.panelLoaded);
        assert.isTrue(window.Test.panelCollapsed);
    });
});
describe('StackPanel', function () {
    describe('Render', function () {
        // Given
        var textBox1 = new TextBox();
        textBox1.setValue('test1');

        var textBox2 = new TextBox();
        textBox2.setValue('test2');

        var stackPanel = new StackPanel();
        var $el;

        it('StackPanel with 2 TextBoxes', function () {
            // When
            stackPanel.addItem(textBox1);
            stackPanel.addItem(textBox2);
            $el = stackPanel.render();

            // Then
            var textboxes = $el.find('input.pl-text-box-input');
            assert.equal(textboxes.length, 2);
            assert.equal($(textboxes[0]).val(), 'test1');
            assert.equal($(textboxes[1]).val(), 'test2');
        });

        it('StackPanel orientation', function () {
            assert.isFalse($el.hasClass('horizontal-orientation'));

            // When
            stackPanel.setOrientation('Horizontal');

            // Then
            assert.isTrue($el.hasClass('horizontal-orientation'));
        });

        it('should be true if scriptsHandlers call', function () {
            //Given
            var applicationBuilder = new Builder();
            var stackPanel = new StackPanelBuilder();
            var view = new View();
            var metadata = {
                OnLoaded:{
                    Name: 'OnLoaded'
                }
            };
            window.Test = {stackPanelLoaded:false};
            view.setScripts([{Name:"OnLoaded", Body:"window.Test.stackPanelLoaded = true"}]);

            //When
            var build = stackPanel.build(applicationBuilder, view, metadata);
            $(build.render());

            // Then
            assert.isTrue(window.Test.stackPanelLoaded);
        });
    });
});
describe('TabPanel', function () {

    var tabPage1, tabPage2, tabPanel;
    var $nav, $content, $tabPanel;

    describe('Render', function () {
        // Given
        var textBox1 = new TextBox();
        textBox1.setValue('test1');

        var textBox2 = new TextBox();
        textBox2.setValue('test2');

        tabPanel = new TabPanel();
        tabPage1 = new TabPage();
        tabPage2 = new TabPage();

        tabPage1.setText('Tab 1');
        tabPage1.setName('Tab1');
        tabPage2.setText('Tab 2');
        tabPage2.setName('Tab2');

        it('TabPanel with 2 TabPages', function () {
            // When
            tabPanel.addPage(tabPage1);
            tabPanel.addPage(tabPage2);
            $tabPanel = tabPanel.render();
            $nav = $('.nav-tabs', $tabPanel);
            $content = $('.tab-content', $tabPanel);

            // Then
            assert.equal($('li', $nav).length, 2);
            assert.isTrue($nav.find('li:first').hasClass('active'));
            assert.isFalse($nav.find('li:last').hasClass('active'));
            assert.equal($nav.find('a[data-toggle="tab"]:first').text(), 'Tab 1');
            assert.equal($nav.find('a[data-toggle="tab"]:last').text(), 'Tab 2');

            assert.equal($('div.tab-pane', $content).length, 2);
            assert.isTrue($content.find('div.tab-pane:first').hasClass('active'));
            assert.isFalse($content.find('div.tab-pane:last').hasClass('active'));
            assert.equal(
                $('a[data-toggle="tab"]:first', $nav).prop('hash').replace(/^#/,''),
                $('div.tab-pane:first', $content).prop('id')
            );
            assert.equal(
                $('a[data-toggle="tab"]:last', $nav).prop('hash').replace(/^#/,''),
                $('div.tab-pane:last', $content).prop('id')
            );

        });

        it('should change selected page', function () {
            // When
            tabPanel.setSelectedPage(tabPage2);
            // Then
            assert.isFalse($nav.find('li:first').hasClass('active'));
            assert.isTrue($nav.find('li:last').hasClass('active'));

        });

        it('should remove page', function () {
            // When
            tabPanel.removePage(tabPage2);
            $nav = $('.nav-tabs', $tabPanel);
            $content = $('.tab-content', $tabPanel);

            // Then
            assert.equal($('li', $nav).length, 1);
            assert.isTrue($nav.find('li:first').hasClass('active'));
        });
    });
});
describe('ViewPanel', function () {

    it('should build', function () {

        //Given
        var metadata = {
            "ViewPanel": {
                "Visible": true,
                "Text": "ViewPanel1",
                "View": {
                    "InlineView": {
                        "View": {
                            LayoutPanel: {
                                StackPanel: {
                                    Items: []
                                }
                            }
                        },
                        "OpenMode": "Application"
                    }
                }
            }
        };

        var applicationBuilder = new ApplicationBuilder();

        //Then
        var panel = applicationBuilder.build(new View(), metadata);

        //When
        assert.equal(panel.getText(), 'ViewPanel1');
    });

});
describe('BooleanFormat', function () {
    describe('format', function () {

        it('successful build', function () {
            //Given
            var metadata = {TrueText: "+", FalseText: "-"};
            var builder = new BooleanFormatBuilder();
            //When
            var format = builder.build(null, null, metadata);
            //Then
            assert.isFunction(format.format);
            assert.isFunction(format.getTrueText);
            assert.isFunction(format.getFalseText);
            assert.isFunction(format.setFalseText);
            assert.isFunction(format.setTrueText);
            assert.equal(format.format(true), '+');
            assert.equal(format.format(false), '-');
        });

        it('should have default value', function () {
            //Given
            var format = new BooleanFormat();
            //When
            var value = true;
            //Then
            assert.equal(format.getFalseText(), 'False');
            assert.equal(format.getTrueText(), 'True');
            assert.equal(format.format(value), 'True');
        });

        it('should format boolean', function () {
            //Given
            var format = new BooleanFormat();
            //When
            var value_1 = false;
            var value_2 = true;
            format.setFalseText('Нет');
            format.setTrueText('Да');
            //Then
            assert.equal(format.format(value_1), 'Нет');
            assert.equal(format.format(value_2), 'Да');
        });

        it('should format collection', function () {
            //Given
            var format = new BooleanFormat();
            //When
            var value = [true, true, false, true];
            format.setFalseText('Нет');
            format.setTrueText('Да');
            //Then
            assert.equal(format.format(value), 'Да, Да, Нет, Да');
        });

    });


});
describe('DateTimeFormat', function () {

    describe('format', function () {
        it('successful build', function () {
            //Given
            var metadata = {};
            var builder = new DateTimeFormatBuilder();
            //When
            var format = builder.build(null, null, metadata);
            //Then
            assert.isFunction(format.format);
            assert.equal(format.getFormat(), 'G');
        });

        it('should format year', function () {
            //Given
            var formattingFull = new DateTimeFormat('yyyy');
            var formattingShort = new DateTimeFormat('yy');
            var formattingTooShort = new DateTimeFormat('%y');

            //When
            var date = new Date("21 May 1908 10:12");

            //Then
            assert.equal(formattingFull.format(date), '1908');
            assert.equal(formattingShort.format(date), '08');
            assert.equal(formattingTooShort.format(date), '8');
        });

        it('should format month', function () {
            //Given
            var formattingFull = new DateTimeFormat('MMMM'),
                formattingAbbr = new DateTimeFormat('MMM'),
                formattingIndex = new DateTimeFormat('MM'),
                formattingShortIndex = new DateTimeFormat('%M'),
                enCulture = new Culture('en-US');

            //When
            var date = new Date("21 January 1908 10:12");

            //Then
            assert.equal(formattingFull.format(date), 'Январь');
            assert.equal(formattingAbbr.format(date), 'янв');
            assert.equal(formattingIndex.format(date), '01');
            assert.equal(formattingShortIndex.format(date), '1');

            assert.equal(formattingFull.format(date, enCulture), 'January');
        });

        it('should format day', function () {
            //Given
            var formattingFull = new DateTimeFormat('dddd'),
                formattingAbbr = new DateTimeFormat('ddd'),
                formattingIndex = new DateTimeFormat('dd'),
                formattingShortIndex = new DateTimeFormat('%d'),
                enCulture = new Culture('en-US');

            //When
            var date = new Date("2 January 1908 10:12");

            //Then
            assert.equal(formattingFull.format(date), 'среда');
            assert.equal(formattingAbbr.format(date), 'Ср');
            assert.equal(formattingIndex.format(date), '02');
            assert.equal(formattingShortIndex.format(date), '2');

            assert.equal(formattingFull.format(date, enCulture), 'Wednesday');
        });

        it('should format day', function () {
            //Given
            var formattingFull = new DateTimeFormat('HH'),
                formattingAbbr = new DateTimeFormat('%H'),
                formattingIndex = new DateTimeFormat('hh'),
                formattingShortIndex = new DateTimeFormat('%h');

            //When
            var date = new Date("2 January 1908 13:12");

            //Then
            assert.equal(formattingFull.format(date), '13');
            assert.equal(formattingAbbr.format(date), '13');
            assert.equal(formattingIndex.format(date), '01');
            assert.equal(formattingShortIndex.format(date), '1');
        });

        it('should format minutes', function () {
            //Given
            var formatting = new DateTimeFormat('mm'),
                formattingShort = new DateTimeFormat('%m');

            //When
            var date = new Date("2 January 1908 13:02");

            //Then
            assert.equal(formatting.format(date), '02');
            assert.equal(formattingShort.format(date), '2');
        });

        it('should format seconds', function () {
            //Given
            var formatting = new DateTimeFormat('ss'),
                formattingShort = new DateTimeFormat('%s');

            //When
            var date = new Date("2 January 1908 13:02:02");

            //Then
            assert.equal(formatting.format(date), '02');
            assert.equal(formattingShort.format(date), '2');
        });

        it('should format pm/am designator', function () {
            //Given
            var formatting = new DateTimeFormat('tt'),
                formattingShort = new DateTimeFormat('%t'),
                enCulture = new Culture('en-US');

            //When
            var datePM = new Date("2 January 1908 13:02");
            var dateAM = new Date("2 January 1908 11:02");

            //Then
            assert.equal(formatting.format(datePM, enCulture), 'PM');
            assert.equal(formatting.format(dateAM, enCulture), 'AM');
            assert.equal(formattingShort.format(dateAM, enCulture), 'A');
            assert.equal(formattingShort.format(dateAM), '');
        });

        it('should format pm/am designator', function () {
            //Given
            var formatting = new DateTimeFormat('zzz');

            //When
            var date = new Date("2 January 1908 13:02:00");

            //Then
            assert.equal(formatting.format(date), extractTimezoneOffset(date));
        });

        it('should format date and time separators', function () {
            //Given
            var formattingTime = new DateTimeFormat('12:23'),
                formattingDate = new DateTimeFormat('12/23'),
                enCulture = new Culture('en-US');

            //When
            var date = new Date("2 January 1908 13:02:00");

            //Then
            assert.equal(formattingTime.format(date), '12:23');
            assert.equal(formattingDate.format(date), '12.23');
            assert.equal(formattingDate.format(date, enCulture), '12/23');
        });

        it('escaping strings', function () {
            //Given
            var formatting1 = new DateTimeFormat('"HH"'),
                formatting2 = new DateTimeFormat("'HH'"),
                formatting3 = new DateTimeFormat('HH "HH"');

            //When
            var date = new Date("2 January 1908 13:12");

            //Then
            assert.equal(formatting1.format(date), 'HH');
            assert.equal(formatting2.format(date), 'HH');
            assert.equal(formatting3.format(date), '13 HH');
        });


        it('format by pattern f', function () {
            //Given
            var formatting = new DateTimeFormat('f'),
                enCulture = new Culture('en-US');

            //When
            var date = new Date("4 January 1908 13:12");

            //Then
            assert.equal(formatting.format(date), '04 Январь 1908 г. 13:12');
            assert.equal(formatting.format(date, enCulture), 'Friday, January 04, 1908 1:12 PM');
        });

        it('format by pattern g', function () {
            //Given
            var formatting = new DateTimeFormat('g'),
                enCulture = new Culture('en-US');

            //When
            var date = new Date("4 January 1908 13:12");

            //Then
            assert.equal(formatting.format(date), '04.01.1908 13:12');
            assert.equal(formatting.format(date, enCulture), '1/4/1908 1:12 PM');
        });

        it('format by pattern s', function () {
            //Given
            var formatting = new DateTimeFormat('s');

            //When
            var date = new Date("4 January 1908 13:12:01");

            //Then
            assert.equal(formatting.format(date), '1908-01-04T13:12:01');
        });

        it('format by pattern T', function () {
            //Given
            var formatting = new DateTimeFormat('T');

            //When
            var date = new Date("4 January 1908 13:12:01");

            //Then
            assert.equal(formatting.format(date), '13:12:1');
        });

        it('format by pattern H', function () {
            //Given
            var formatting = new DateTimeFormat('H');

            //When
            var date = new Date("4 January 1908 13:12:01");

            //Then
            assert.equal(formatting.format(date), '13');
        });

        it('format collection', function () {
            //Given
            var formatting = new DateTimeFormat('s');

            //When
            var date = [new Date("4 January 1908 13:12:1"), new Date("5 January 1908 13:12:1"), new Date("6 January 1908 13:12:1")];

            //Then
            assert.equal(formatting.format(date), '1908-01-04T13:12:01, 1908-01-05T13:12:01, 1908-01-06T13:12:01');
        });

        it('format collection t', function () {
            //Given
            var formatting = new DateTimeFormat('t');

            //When
            var date = [new Date("4 January 1908 13:12:1"), new Date("5 January 1908 13:02:1"), new Date("6 January 1908 13:12:1")];

            //Then
            assert.equal(formatting.format(date), '13:12, 13:02, 13:12');
        });

        function extractTimezoneOffset(date){
            var offset;
            date.toString().replace(/GMT([\s\S]{5})/, function(s, inner){
                offset = inner;
                return '';
            });
            offset = offset.split('');
            offset.splice(3, 0, ':');
            offset = offset.join('');
            return offset;
        }
    });
});
describe('NumberFormatting', function () {
    describe('format', function () {
        it('successful build', function () {
            //Given
            var metadata = {};
            var builder = new NumberFormatBuilder();
            //When
            var format = builder.build(null, null, metadata);
            //Then
            assert.isFunction(format.format);
            assert.equal(format.getFormat(), 'n');
        });

        it('should format percent', function () {
            //Given
            var formatting_p = new NumberFormat('p');
            var formatting_p0 = new NumberFormat('p0');
            var formatting_p1 = new NumberFormat('p1');
            var enCulture = new Culture('en-US');

            //When
            var val = 123.4567;

            //Then
            assert.equal(formatting_p.format(val), '12 345,67%');
            assert.equal(formatting_p0.format(val), '12 346%');
            assert.equal(formatting_p1.format(val), '12 345,7%');

            assert.equal(formatting_p1.format(val, enCulture), '12,345.7 %');
        });

        it('should format number', function () {
            //Given
            var formatting_n = new NumberFormat('n');
            var formatting_n0 = new NumberFormat('n0');
            var formatting_n1 = new NumberFormat('n1');
            var enCulture = new Culture('en-US');

            //When
            var val = 1234.5678;

            //Then
            assert.equal(formatting_n.format(val), '1 234,57');
            assert.equal(formatting_n0.format(val), '1 235');
            assert.equal(formatting_n1.format(val), '1 234,6');

            assert.equal(formatting_n1.format(val, enCulture), '1,234.6');
        });

        it('should format currency', function () {
            //Given
            var formatting_c = new NumberFormat('c');
            var formatting_c0 = new NumberFormat('c0');
            var formatting_c1 = new NumberFormat('c1');
            var enCulture = new Culture('en-US');

            //When
            var val = 1234.5678;

            //Then
            assert.equal(formatting_c.format(val), '1 234,57р.');
            assert.equal(formatting_c0.format(val), '1 235р.');
            assert.equal(formatting_c1.format(val), '1 234,6р.');

            assert.equal(formatting_c1.format(val, enCulture), '$1,234.6');
        });

        it('should format collections', function () {
            //Given
            var formatting_c = new NumberFormat('c');
            var formatting_c0 = new NumberFormat('c0');
            var formatting_c1 = new NumberFormat('c1');
            var enCulture = new Culture('en-US');

            //When
            var val = [1234.5678, 2901.2345, 2678.9012];

            //Then
            assert.equal(formatting_c.format(val), '1 234,57р., 2 901,23р., 2 678,90р.');
            assert.equal(formatting_c0.format(val), '1 235р., 2 901р., 2 679р.');
            assert.equal(formatting_c1.format(val), '1 234,6р., 2 901,2р., 2 678,9р.');

            assert.equal(formatting_c1.format(val, enCulture), '$1,234.6, $2,901.2, $2,678.9');
        });

    });

});
describe('ObjectFormat', function () {
    describe('format', function () {

        it('successful build', function () {
            //Given
            var metadata = {Format: '{}'};
            var builder = new ObjectFormatBuilder();
            //When
            var format = builder.build(null, null, metadata);
            //Then
            assert.isFunction(format.format);
            assert.equal(format.getFormat(), '{}');
        });

        it('should format simple data type ', function () {
            //Given
            var formatter_1 = new ObjectFormat("Hello, {}!");
            var formatter_2 = new ObjectFormat("Birth date: {:d}");
            var formatter_3 = new ObjectFormat("Birth time: {:T}");
            var formatter_4 = new ObjectFormat("Weight: {:n2} kg");
            var enCulture = new Culture('en-US');

            //When
            var value_1 = 'Ivan';
            var value_2 = new Date("4 January 1908 12:34:56");
            var value_3 = new Date("4 January 1908 12:34:56");
            var value_4 = 123.456;

            //Then
            assert.equal(formatter_1.format(value_1, enCulture), 'Hello, Ivan!');
            assert.equal(formatter_2.format(value_2, enCulture), 'Birth date: 1/4/1908');
            assert.equal(formatter_3.format(value_3, enCulture), 'Birth time: 12:34:56 PM');
            assert.equal(formatter_4.format(value_4, enCulture), 'Weight: 123.46 kg');
            assert.equal(formatter_4.format(value_4), 'Weight: 123,46 kg');
        });

        it('should format complex data type ', function () {
            //Given
            var formatter_1 = new ObjectFormat("Hello, {FirstName} {MiddleName}!");
            var formatter_2 = new ObjectFormat("Birth date: {BirthDate:d}");
            var formatter_3 = new ObjectFormat("Birth time: {BirthDate:T}");
            var formatter_4 = new ObjectFormat("Weight: {Weight:n2} kg");
            var enCulture = new Culture('en-US');

            //When
            var value_1 = { FirstName: "Ivan", MiddleName: "Ivanovich" };
            var value_2 = { BirthDate: new Date("4 January 1908 12:34:56") };
            var value_3 = { BirthDate: new Date("4 January 1908 12:34:56") };
            var value_4 = { Weight: 123.456 };

            //Then
            assert.equal(formatter_1.format(value_1, enCulture), "Hello, Ivan Ivanovich!");
            assert.equal(formatter_2.format(value_2, enCulture), "Birth date: 1/4/1908");
            assert.equal(formatter_3.format(value_3, enCulture), "Birth time: 12:34:56 PM");
            assert.equal(formatter_4.format(value_4, enCulture), "Weight: 123.46 kg" );
        });

        it('should format collection ', function () {
            //Given
            var formatter_1 = new ObjectFormat("Hello, {FirstName} {MiddleName}!");
            var formatter_2 = new ObjectFormat("Birth date: {BirthDate:d}");
            var formatter_3 = new ObjectFormat("Birth time: {BirthDate:T}");
            var formatter_4 = new ObjectFormat("Weight: {Weight:n2} kg");
            var enCulture = new Culture('en-US');

            //When
            var value_1 = [{ FirstName: "Ivan", MiddleName: "Ivanovich" }, { FirstName: "Petr", MiddleName: "Petrov" }];
            var value_2 = { BirthDate: new Date("4 January 1908 12:34:56") };
            var value_3 = { BirthDate: new Date("4 January 1908 12:34:56") };
            var value_4 = [{ Weight: 123.456 }, { Weight: 789.012 }];

            //Then
            assert.equal(formatter_1.format(value_1, enCulture), "Hello, Ivan Ivanovich!, Hello, Petr Petrov!");
            assert.equal(formatter_2.format(value_2, enCulture), "Birth date: 1/4/1908");
            assert.equal(formatter_3.format(value_3, enCulture), "Birth time: 12:34:56 PM");
            assert.equal(formatter_4.format(value_4, enCulture), "Weight: 123.46 kg, Weight: 789.01 kg" );
        });

    });

});
describe('LinkView', function () {

    describe('setOpenMode', function () {
        it('should set openMode', function () {
            //Given
            var view = new LinkView();

            //When
            view.setOpenMode('Dialog');

            //Then
            assert.equal(view.getOpenMode(), 'Dialog');
        });

        it('should set openMode Page by default', function () {
            //Given
            var view = new LinkView();

            //Then
            assert.equal(view.getOpenMode(), 'Page');
        });

        it('should set openMode Page if no mode passed', function () {
            //Given
            var view = new LinkView();

            //When
            view.setOpenMode(null);

            //Then
            assert.equal(view.getOpenMode(), 'Page');
        });
    });
});
describe('MetadataViewBuilder', function () {

    var builder = new ApplicationBuilder();

    window.providerRegister.register('MetadataDataSource', function (metadataValue) {
        return {
            "getViewMetadata": function () {
                return metadata;
            }
        };
    });

    var metadata = {
            "DataSources": [

                {
                    "DocumentDataSource": {
                        "Name": 'PatientDataSource',
                        "ConfigId": 'ReceivingRoom',
                        "DocumentId": 'HospitalizationRefusal'
                    }
                }
            ],
            "OpenMode": "Application",
            "ConfigId": 'ReceivingRoom',
            "DocumentId": 'HospitalizationRefusal',
            "ViewType": 'ListView',
            "MetadataName": 'HospitalizationRefusalListView',
            //"Parameters": [
            //    {
            //        "Name" : 'Param1',
            //        "Value" : {
            //            "PropertyBinding": {
            //                "DataSource": 'PatientDataSource',
            //                "Property": 'LastName'
            //            }
            //        }
            //    }
            //],
            "LayoutPanel" : {

            }
    };

    it('should build exists view', function () {

        var applicationBuilder = new ApplicationBuilder();
        var builder = new MetadataViewBuilder();
        var view = builder.build(applicationBuilder,parent,metadata);

        applicationBuilder.appView = view;
        applicationBuilder.appView.createView(function(view){
            //assert.isNotNull(view.getParameter('Param1'));
            assert.isNotNull(view.getDataSource('PatientDataSource'));
        });
    });
});


describe('MessageBus', function () {
    var bus;

    beforeEach(function () {
        bus = new MessageBus();
    });

    describe('getExchange', function () {
        it('should throw error for empty exchangeName', function () {
            try {
                bus.getExchange();
            } catch (e) {
                assert.ok(true);
                return;
            }

            assert.fail();
        });

        it('should return exchange', function () {
            var exchange = bus.getExchange('test');

            assert.isNotNull(exchange);
        });
    })
});
describe('MessageExchange', function () {
    var messageExchange;

    beforeEach(function () {
        messageExchange = new MessageBus().getExchange('test');
    });

    describe('send', function () {
        it('should send', function () {
            var flag = 0;

            messageExchange.subscribe(messageTypes.onViewOpened, function (obj) {
                flag += obj;
            });
            messageExchange.subscribe(messageTypes.onViewOpened, function (obj) {
                flag += obj;
            });
            messageExchange.subscribe(messageTypes.onViewOpened, function (obj) {
                flag += obj;
            });

            messageExchange.send(messageTypes.onViewOpened, 2);

            assert.equal(flag, 6);
        });

        it('should deliver message to valid subscribers', function () {
            var flag1 = 0,
                flag2 = 0;

            messageExchange.subscribe(messageTypes.onViewOpened, function (obj) {
                flag1 += obj;
            });
            messageExchange.subscribe(messageTypes.onViewOpened, function (obj) {
                flag1 += obj;
            });
            messageExchange.subscribe(messageTypes.onViewClosed, function (obj) {
                flag2 += obj;
            });
            messageExchange.subscribe(messageTypes.onViewClosed, function (obj) {
                flag2 += obj;
            });

            messageExchange.send(messageTypes.onViewOpened, 1);
            messageExchange.send(messageTypes.onViewClosed, 2);

            assert.equal(flag1, 2);
            assert.equal(flag2, 4);
        });
    });
});
describe('Script', function () {
    describe('render', function () {
        it('Setting the properties: name, body', function () {
            //Given
            var metadata = [
                {
                    Name: "colorButton",
                    Body: "context.v = 5; args.Text = args.Text + ' text'; args.Value = 1*10;"
                },
                {
                    Name: "changeValue",
                    Body: "args.Items = Object.keys(args);context = delete context['v'];"
                }
            ];

            var sb = new ScriptBuilder();

            var script = new Script();
            var script1 = new Script();

            _.each(metadata, function(el, i){
                if(!i){
                    script = sb.build(el);
                }else {
                    script1 = sb.build(el);
                }
            });

            var ContextObj = {v: 1};
            var ArgumentsObj = {Text: "Same", Value: 1};
            var ContextObj1 = {v: 10};
            var ArgumentsObj1 = {Text: "Same text", Value: 5};

            //When
            script.run(ContextObj, ArgumentsObj);
            script1.run(ContextObj1, ArgumentsObj1);

            //Then
            assert.equal(ArgumentsObj.Text, "Same text");
            assert.equal(ArgumentsObj.Value, 10);
            assert.equal(ContextObj.v, 5);

            assert.equal(ArgumentsObj1.Items[0], 'Text');
            assert.equal(ArgumentsObj1.Items[1], 'Value');
            assert.isTrue($.isEmptyObject(ContextObj1));
        });
    });
});
describe('ScriptExecutor', function () {

    var builder = new ApplicationBuilder();

    window.providerRegister.register('MetadataDataSource', function (metadataValue) {
        return {
            "getViewMetadata": function () {
                return metadata;
            }
        };
    });

    var metadata = {
        "Scripts" :[
            {
                "Name" : "OpenViewScript",
                "Body" : "context.Controls['TextBox1'].setText('Hello world from script!');"
            },
            {
                "Name" : "TestRunScript",
                "Body" : "context.TestValue = args['test'];"
            }
        ],
        "DataSources": [

            {
                "DocumentDataSource": {
                    "Name": 'PatientDataSource',
                    "ConfigId": 'ReceivingRoom',
                    "DocumentId": 'HospitalizationRefusal'
                }
            },
            {
                "DocumentDataSource" : {
                    "Name" : 'ClassifierDataSource',
                    "ConfigId" : 'ClassifierStorage',
                    "DocumentId" : 'SomeClassifier'
                }
            }
        ],
        "OpenMode": "Application",
        "ConfigId": 'ReceivingRoom',
        "DocumentId": 'HospitalizationRefusal',
        "ViewType": 'ListView',
        "MetadataName": 'HospitalizationRefusalListView',
        //"Parameters": [
        //    {
        //        "Name" : 'Param1'
        //    }
        //],
        "LayoutPanel" : {
            "StackPanel": {
                "Name": "MainViewPanel",
                "Items": [
                    {
                        "TextBox": {
                            "Name": "TextBox1",
                            "Multiline": true
                        }
                    },
                    {
                        "TextBox": {
                            "Name": "TextBox2"
                        }
                    },
                    {
                        "ComboBox": {
                            "Name": "ComboBox1",
                            "DisplayProperty": "",
                            "ValueProperty": "",
                            "MultiSelect": true,
                            "ShowClear": true,
                            "Value" : {
                                "PropertyBinding" : {
                                    "DataSource" : "PatientDataSource",
                                    "Property" : "LastName"
                                }
                            }
                        }
                    }
                ]
            }
        }
    };

    it('should create script context for opened view', function (done) {

        var linkView = new LinkView(null, function (resultCallback) {
            var builder = new ApplicationBuilder();
            var view = builder.buildType(fakeView(), 'View', metadata);
            resultCallback(view);
        });
        linkView.setOpenMode('Application');

        linkView.createView(function(view){

            assert.isNotNull(view.getContext());
            assert.isNotNull(view.getContext().DataSources['PatientDataSource']);
            assert.isNotNull(view.getContext().DataSources['ClassifierDataSource']);
            //assert.isNotNull(view.getContext().Parameters['Param1']);
            //assert.equal(view.getContext().Parameters['Param1'].getValue(),'1');
            assert.isNotNull(view.getContext().Controls['TextBox1']);
            assert.isNotNull(view.getContext().Controls['TextBox2']);
            assert.isNotNull(view.getContext().Controls['ComboBox1']);

            var textBox1 = view.getContext().Controls['TextBox1'];

            textBox1.setText('Hello world!');
            assert.equal(textBox1.getText(),'Hello world!');

            var dataSource = view.getContext().DataSources["PatientDataSource"];
            assert.equal(dataSource.getName(),"PatientDataSource");

            done();
        });
    });

    it('should invoke script from ScriptExecutor', function(done){

        var linkView = new LinkView(null, function (resultCallback) {
            var builder = new ApplicationBuilder();
            var view = builder.buildType(fakeView(), 'View', metadata);
            resultCallback(view);
        });
        linkView.setOpenMode('Application');

        linkView.createView(function(view){

            var scriptExecutor = new ScriptExecutor(view);
            scriptExecutor.executeScript('OpenViewScript');

            var textBox1 = view.getContext().Controls["TextBox1"];
            assert.equal(textBox1.getText(),'Hello world from script!');

            var args = {
                "test" : 1
            };

            var context = view.getContext();
            context.Scripts["TestRunScript"].Run(context,args);

            assert.equal(context.TestValue,1);

            done();

        });

    });


});
describe("ObjectUtils", function () {
    describe("getPropertyValue", function () {
        it("should return null when target is null or undefined", function () {
            // When
            var result1 = InfinniUI.ObjectUtils.getPropertyValue(null, "Property1");
            var result2 = InfinniUI.ObjectUtils.getPropertyValue(undefined, "Property1");

            // Then
            assert.isNull(result1);
            assert.isNull(result2);
        });

        it("should return null when property is not exists", function () {
            // Given
            var target = { };

            // When
            var result = InfinniUI.ObjectUtils.getPropertyValue(target, "NotExistsProperty");

            // Then
            assert.isNull(result);
        });

        it("should return collection item when target is collection", function () {
            // Given
            var target = [ 11, 22, 33 ];

            // When
            var item0 = InfinniUI.ObjectUtils.getPropertyValue(target, "0");
            var item1 = InfinniUI.ObjectUtils.getPropertyValue(target, "1");
            var item2 = InfinniUI.ObjectUtils.getPropertyValue(target, "2");
            var item3 = InfinniUI.ObjectUtils.getPropertyValue(target, "3");

            // Then
            assert.equal(item0, 11);
            assert.equal(item1, 22);
            assert.equal(item2, 33);
            assert.isNull(item3);
        });

        it("should return property value", function () {
            // Given
            var value = { };
            var target = { Property1: value };

            // When
            var result = InfinniUI.ObjectUtils.getPropertyValue(target, "Property1");

            // Then
            assert.equal(result, value);
        });

        it("should return nested property value", function () {
            // Given
            var value = { };
            var target = { Property1: { Property2: value } };

            // When
            var result = InfinniUI.ObjectUtils.getPropertyValue(target, "Property1.Property2");

            // Then
            assert.equal(result, value);
        });

        it("should return property value of specified collection item", function () {
            // Given
            var target = {
                Collection1: [
                    { Property1: 11 },
                    { Property1: 22 },
                    { Property1: 33 }
                ]
            };

            // When
            var item0 = InfinniUI.ObjectUtils.getPropertyValue(target, "Collection1.0.Property1");
            var item1 = InfinniUI.ObjectUtils.getPropertyValue(target, "Collection1.1.Property1");
            var item2 = InfinniUI.ObjectUtils.getPropertyValue(target, "Collection1.2.Property1");
            var item3 = InfinniUI.ObjectUtils.getPropertyValue(target, "Collection1.3.Property1");

            // Then
            assert.equal(item0, 11);
            assert.equal(item1, 22);
            assert.equal(item2, 33);
            assert.isNull(item3);
        });
    });

    describe("setPropertyValue", function () {
        it("should not throw exception when target is null or undefined", function () {
            InfinniUI.ObjectUtils.setPropertyValue(null, "property1", { });
            InfinniUI.ObjectUtils.setPropertyValue(undefined, "property1", { });
        });

        it("should set property value", function () {
            // Given
            var target = { property1: 123 };
            var propertyValue = 321;

            // When
            InfinniUI.ObjectUtils.setPropertyValue(target, "property1", propertyValue);

            // Then
            assert.equal(target.property1, propertyValue);
        });

        it("should set nested property value", function () {
            // Given
            var target = { property1: { property2: 123 } };
            var propertyValue = 321;

            // When
            InfinniUI.ObjectUtils.setPropertyValue(target, "property1.property2", propertyValue);

            // Then
            assert.equal(target.property1.property2, propertyValue);
        });

        it("should create all not exists properties in path", function () {
            // Given
            var target = { };
            var propertyValue = { };

            // When
            InfinniUI.ObjectUtils.setPropertyValue(target, "property1.property2.property3", propertyValue);

            // Then
            assert.isObject(target.property1.property2.property3);
            assert.isObject(propertyValue);
            assert.equal(_.isEmpty(target.property1.property2.property3), _.isEmpty(propertyValue));
        });

        it("should replace collection item when target is collection", function () {
            // Given
            var target = [ 11, 0, 33 ];

            // When
            InfinniUI.ObjectUtils.setPropertyValue(target, "1", 22);

            // Then
            assert.equal(target.length, 3);
            assert.equal(target[0], 11);
            assert.equal(target[1], 22);
            assert.equal(target[2], 33);
        });

        it("should set property of specified collection item", function () {
            // Given
            var target = { collection1: [ { property1: 11 }, { property1: 0 }, { property1: 33 } ] };

            // When
            InfinniUI.ObjectUtils.setPropertyValue(target, "collection1.1.property1", 22);

            // Then
            assert.equal(target.collection1.length, 3);
            assert.equal(target.collection1[0].property1, 11);
            assert.equal(target.collection1[1].property1, 22);
            assert.equal(target.collection1[2].property1, 33);
        });
    });
});