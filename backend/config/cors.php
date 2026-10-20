<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
    ],

    'allowed_origins_patterns' => [
        '#^https?://([a-z0-9-]+\.)?loca\.lt(:\d+)?$#i',
        '#^https?://([a-z0-9-]+\.)?localtunnel\.me(:\d+)?$#i',
    ],

    'allowed_headers' => ['*'],

    'supports_credentials' => true,

];
