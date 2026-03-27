import json
from http.server import BaseHTTPRequestHandler, HTTPServer

def get_eta(head, direction, target, max_floor):
    if direction == "UP":
        if target >= head:
            return target - head
        else:
            return (max_floor - head) + (max_floor - target)
    else:
        if target <= head:
            return head - target
        else:
            return head + target

def calculate_scan(head, requests, direction, max_floor):
    if not requests:
        return [], 0
    
    left = [r for r in requests if r < head]
    right = [r for r in requests if r > head]
    at_head = list(set([r for r in requests if r == head]))
    
    # In SCAN, we travel to limits if there are requests awaiting on the reverse path
    if direction == "UP" and left:
        right.append(max_floor)
    elif direction == "DOWN" and right:
        left.append(0)
        
    left = list(set(left))
    right = list(set(right))

    left.sort(reverse=True) # descending
    right.sort() # ascending
    
    sequence = []
    if at_head:
        sequence.append(head)
    
    dist = 0
    curr = head
    
    runs = 2
    curr_dir = direction
    
    while runs > 0:
        if curr_dir == "UP":
            for r in right:
                sequence.append(r)
                dist += abs(r - curr)
                curr = r
            curr_dir = "DOWN"
        else:
            for r in left:
                sequence.append(r)
                dist += abs(r - curr)
                curr = r
            curr_dir = "UP"
        runs -= 1
        
    return sequence, dist

class RequestHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()

    def do_POST(self):
        if self.path == '/optimize':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError:
                self.send_response(400)
                self.end_headers()
                return
            
            max_floor = data.get('maxFloor', 50)
            reqs = data.get('requests', [])
            lift_a = data.get('liftA', {'head': 0, 'dir': 'UP'})
            lift_b = data.get('liftB', {'head': 0, 'dir': 'UP'})
            
            reqs_a, reqs_b = [], []
            
            # Simple ETA-based dispatcher algorithms for 2 elevators
            for r in reqs:
                eta_a = get_eta(lift_a['head'], lift_a['dir'], r, max_floor)
                eta_b = get_eta(lift_b['head'], lift_b['dir'], r, max_floor)
                if eta_a <= eta_b:
                    reqs_a.append(r)
                else:
                    reqs_b.append(r)
                    
            seq_a, dist_a = calculate_scan(lift_a['head'], reqs_a, lift_a['dir'], max_floor)
            seq_b, dist_b = calculate_scan(lift_b['head'], reqs_b, lift_b['dir'], max_floor)
            
            response = {
                'liftA': {'requests': reqs_a, 'sequence': seq_a, 'distance': dist_a},
                'liftB': {'requests': reqs_b, 'sequence': seq_b, 'distance': dist_b},
                'totalDistance': dist_a + dist_b
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

import os
import webbrowser
import socket

def get_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        return s.getsockname()[1]

def run(server_class=HTTPServer, handler_class=RequestHandler):
    port = get_free_port()
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    
    import urllib.request
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, 'index.html')
    # Use pathname2url to ensure safe formatting for query parameters across browsers
    file_url = "file:" + urllib.request.pathname2url(file_path)
    index_path = f"{file_url}?port={port}"
    
    print("\nLiftSCAN backend started!")
    print(f"Access App at: {index_path}")
    print(f"Dynamic Port assigned: {port}")
    print("--- Close this terminal to stop the engine ---")
    
    webbrowser.open(index_path)
    httpd.serve_forever()

if __name__ == '__main__':
    run()
