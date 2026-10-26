# Forum ICTU - De tai so 15

## Gioi thieu
Forum ICTU la he thong dien dan cong dong danh cho sinh vien,
ho tro chia se kien thuc, trao doi va thao luan.

## Cong nghe su dung
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MySQL 8.0
- Quan ly Database: phpMyAdmin
- Reverse Proxy: Nginx
- Trien khai: Docker Compose

## Chuc nang
- Dang ky, dang nhap tai khoan
- Xem danh muc va danh sach bai viet
- Tao, sua, xoa bai viet
- Xem chi tiet bai viet
- Them, sua, xoa binh luan

## Huong dan trien khai
1. Cai dat Docker va Docker Compose.
2. Sao chep file .env.example thanh .env.
3. Thay cac gia tri mau trong .env bang mat khau bao mat.
4. Chay lenh: docker compose up -d --build
5. Mo trinh duyet: http://localhost:8088

## Bao mat
- Su dung bien moi truong de quan ly mat khau
- Nginx cau hinh Security Headers
- Docker Network Isolation
- Chay container voi tai khoan non-root
- Han che cong truy cap Backend va phpMyAdmin

## Giam sat va nhat ky
Prometheus, Grafana, Loki va Promtail se duoc bo sung
trong cac giai doan tiep theo.

### Prometheus
- Thu thap metrics tu cac container Docker.
- Giam sat tai nguyen CPU, RAM.
- Theo doi Nginx, MySQL va Ubuntu thong qua exporters.
- Truy cap: http://localhost:9090

### Grafana
- Truc quan hoa metrics tu Prometheus.
- Dashboard: Forum ICTU - System Monitoring.
- Hien thi tinh trang dich vu, CPU, RAM va MySQL.
- Truy cap: http://localhost:3000

### Loki va Promtail
- Promtail thu thap log cua cac container Docker.
- Loki luu tru va cho phep truy van log.
- Grafana Explore duoc su dung de tim kiem log.

### Truy van LogQL

1. Xem toan bo log Docker:
   {job="forum-docker"}

2. Loc cac dong log loi:
   {job="forum-docker"} |~ "(?i)error"

3. Thong ke so dong log trong 5 phut:
   sum(count_over_time({job="forum-docker"}[5m]))

### Khoi dong he thong giam sat

docker compose up -d
docker compose ps
