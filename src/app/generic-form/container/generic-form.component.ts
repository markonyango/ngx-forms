import { DynamicFieldConfig, formType } from './../elements/dynamic-field-config';
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  exportAs: 'dynamicForm',
  selector: 'dynamic-form',
  templateUrl: './generic-form.component.html',
  styleUrls: ['./generic-form.component.scss']
})
export class GenericFormComponent implements OnInit, OnChanges {
  @Input()
  public config: DynamicFieldConfig[] = [];

  public form: FormGroup;

  get controls() {
    return this.config.filter(({ type }) => type !== 'button');
  }
  get changes() {
    return this.form.valueChanges;
  }
  get valid() {
    return this.form.valid;
  }
  get value() {
    return this.form.value;
  }

  constructor(private _fb: FormBuilder) {}

  public ngOnInit() {
    this.form = this.createGroup();
  }

  public ngOnChanges() {
    if (this.form) {
      const controls: string[] = Object.keys(this.form.controls);
      const configControls: string[] = this.controls.map(item => item.name);

      controls
        .filter(control => !configControls.includes(control))
        .forEach(control => this.form.removeControl(control));

      configControls.filter(control => !controls.includes(control)).forEach(name => {
        const config = this.config.find(control => control.name === name);
        this.form.addControl(name, this.createControl(config));
      });
    }
  }

  public createGroup() {
    const group = this._fb.group({});
    this.config.forEach(control => group.addControl(control.name, this.createControl(control)));
    return group;
  }

  public createControl(config: DynamicFieldConfig) {
    const { disabled, validation, value } = config;

    switch (config.formType) {
      case formType.formControl:
        return this._fb.control({ disabled, value }, validation);
      case formType.formArray:
        return this._fb.array([...value], validation);
      case formType.formGroup:
        return this._fb.group({ disabled, value }, validation);
      default:
        return this._fb.control({ disabled, value }, validation);
    }
  }
}
