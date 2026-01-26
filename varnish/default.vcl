vcl 4.1;

# Backend definition
backend default {
    .host = "backend";
    .port = "3000";
    .connect_timeout = 5s;
    .first_byte_timeout = 10s;
    .between_bytes_timeout = 2s;
}

# Request processing
sub vcl_recv {
    # Allow purging from localhost
    if (req.method == "PURGE") {
        return (purge);
    }

    # Only cache GET and HEAD requests
    if (req.method != "GET" && req.method != "HEAD") {
        return (pass);
    }

    # Remove cookies for static assets AND API (Stateless API)
    # This ensures "localhost" cookies don't break caching
    unset req.http.Cookie;
    
    return (hash);
}

# Backend response processing
sub vcl_backend_response {
    # Respect Cache-Control from backend
    if (beresp.http.Cache-Control) {
        # If backend says don't cache, respect it
        if (beresp.http.Cache-Control ~ "no-cache" || 
            beresp.http.Cache-Control ~ "no-store" || 
            beresp.http.Cache-Control ~ "private") {
            set beresp.uncacheable = true;
            return (deliver);
        }
    }

    # Cache successful responses
    if (beresp.status == 200 || beresp.status == 301 || beresp.status == 302) {
        # Allow stale content for 24h if backend is down
        set beresp.grace = 24h;
    }
}

# Delivery to client
sub vcl_deliver {
    # Is this a cache hit or miss?
    if (obj.hits > 0) {
        set resp.http.X-Cache = "HIT";
    } else {
        set resp.http.X-Cache = "MISS";
    }

    # Debug headers
    set resp.http.X-Cache-Hits = obj.hits;
    
    # 🔓 CORS HEADERS for Frontend (localhost:5173)
    set resp.http.Access-Control-Allow-Origin = "*";
    set resp.http.Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS, PURGE";
    set resp.http.Access-Control-Allow-Headers = "Origin, X-Requested-With, Content-Type, Accept, Authorization";
    set resp.http.Access-Control-Expose-Headers = "X-Cache, X-Cache-Hits";
    
    # Add timing information
    set resp.http.X-Served-By = "VelocityEdge-Varnish";
    
    # Remove backend server header for security
    unset resp.http.X-Powered-By;
    
    return (deliver);
}

# Handle synthetic responses (like PURGE success)
sub vcl_synth {
    if (resp.status == 200 && req.method == "PURGE") {
        set resp.http.Access-Control-Allow-Origin = "*";
        set resp.http.Access-Control-Allow-Methods = "GET, POST, PUT, DELETE, OPTIONS, PURGE";
    }
    return (deliver);
}

# Handle errors gracefully
sub vcl_backend_error {
    # Serve stale content if available
    if (beresp.http.X-Cache == "HIT") {
        return (deliver);
    }
}
