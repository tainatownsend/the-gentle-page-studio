# Engineering note

The manual failure evidence shows the same reader-facing source-syntax leakage in static and fillable exports. Treat the shared compiler/finalization stage as the primary investigation point before touching serializer-specific rendering.
