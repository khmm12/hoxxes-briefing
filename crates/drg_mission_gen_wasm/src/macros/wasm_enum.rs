#[macro_export]
macro_rules! wasm_string_enum {
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
        #[derive(Debug, Copy, Clone, PartialEq, ::serde::Serialize, ::tsify::Tsify)]
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
