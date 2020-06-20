# Main Workflow

1. Connect to mod-host.
2. Scan plugins, make list.
3. Present Dashboard.

# Layout

p a r a m e t ers
fx x
x x vol mix pan

# Shell commands

### Run mod-host and Get PID

`mod-host -p 0 | grep -o "[0-9]*" -m 1`

### Get running IP/Port

`netstat -ano -p tcp | grep PID | grep tcp | awk '{print $4}'`
