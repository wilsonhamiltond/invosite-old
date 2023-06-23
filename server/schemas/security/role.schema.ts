import { Schema } from 'mongoose'
import { ModuleSchema } from './module.schema'
import { WidgetSchema } from './widget.schema'
import { OfficeSchema } from '../administration/office.schema'
import { SettingSchema } from '../administration/setting.schema'
export const RoleSchema = new Schema({
    name: String,
    description: String,
    is_active: Boolean,
    modules: [ModuleSchema],
    craete_date: Date,
    widgets: [WidgetSchema],
    offices: [OfficeSchema],
    create_user: {
        required: false,
        type: Object
    },
    setting: {
        type: SettingSchema
    }
})