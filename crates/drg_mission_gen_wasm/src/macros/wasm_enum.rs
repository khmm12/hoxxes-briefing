#[macro_export]
macro_rules! wasm_enum_with_simple_mapping {
    (
        $(#[$meta:meta])*
        $vis:vis enum $WasmEnum:ident {
            $(
                $(#[$variant_meta:meta])*
                $Variant:ident
            ),* $(,)?
        }

        from $CoreEnum:path
    ) => {
        $(#[$meta])*
        #[wasm_bindgen]
        #[derive(Debug, Copy, Clone, PartialEq, ::serde::Serialize)]
        $vis enum $WasmEnum {
            $(
                $(#[$variant_meta])*
                $Variant,
            )*
        }

        impl From<$CoreEnum> for $WasmEnum {
            fn from(value: $CoreEnum) -> Self {
                use $CoreEnum as CoreEnum;
                match value {
                    $(CoreEnum::$Variant => $WasmEnum::$Variant),*
                }
            }
        }
    };
}

#[macro_export]
macro_rules! wasm_enum_with_mapping {
    (
        $(#[$outer:meta])*
        $vis:vis enum $WasmEnum:ident {
            $(
                $(#[$variant_meta:meta])*
                $Variant:ident {
                    $($field:ident : $type:ty),* $(,)?
                }
            ),* $(,)?
        }

        from $CoreEnum:path
    ) => {
        $(#[$outer])*
        #[derive(Debug, Clone, Copy, PartialEq, ::serde::Serialize, ::tsify::Tsify)]
        #[serde(tag = "kind")]
        $vis enum $WasmEnum {
            $(
                #[serde(rename_all = "camelCase")]
                $Variant {
                    $($field: $type),*
                }
            ),*
        }

        impl From<$CoreEnum> for $WasmEnum {
            fn from(value: $CoreEnum) -> Self {
                use $CoreEnum as CoreEnum;

                match value {
                    $(
                        CoreEnum::$Variant { $($field),* } => {
                            $WasmEnum::$Variant { $($field),* }
                        }
                    ),*
                }
            }
        }
    };
}
