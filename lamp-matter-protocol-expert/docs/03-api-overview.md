# API 概览（精要）

- createMatterKit(options?: CreateMatterKitOptions) => CreateMatterKitResult

## CreateMatterKitResult 关键字段
- interceptors：默认拦截器配置（initDevInfo/initDpState/publishDps 等）
- resolveMatterDevInfo：Matter schema → 标准 schema
- mapMatterDpState：Matter DP → 标准 DP（上报转换）
- mapPublishMatterDps：标准 DP → Matter DP（下发转换）
- resolveColorData：颜色数据解析（结合 bright 与设备信息）

### utils
- checkIsMatterDevice(schema, force?)
- checkIsMatterHasWhite(dpSchema, force?)
- getMatterRoad(dpSchema, force?) → 返回 1/2/3/4/5 路
- temp2Number(kelvin, schemaObj) / number2Temp(value, schemaObj)
- bright2Number(bright, schemaObj) / number2Bright(value, schemaObj)
- getTempRgb(kelvin)

### hooks
- useOriginMatterTemp()：获取原始 color_temp_control 值（避免精度损失）

### dpCodes（标准 DP）
- powerCode: switch_led
- brightCode: bright_value
- temperatureCode: temp_value
- colourCode: colour_data

### Matter dpCodes
- switch: 'switch'
- brightness_control: 'brightness_control'
- color_temp_control: 'color_temp_control'
- hsColorCode: 'hs_color_set'
