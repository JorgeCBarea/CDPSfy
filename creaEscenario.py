#!/usr/bin/python

import sys
import os
import time
import subprocess


def arranca():
	os.system("sudo ./bin/prepare-p7-vm")
	os.system("sudo vnx -f p7.xml -v --create")
 

 
def main():
	arranca()
	time.sleep(10)	

	################################################################
	## GLUSTER FS ## 
	################################################################

	os.system("sudo lxc-attach -n nas1 -- gluster peer probe 10.1.3.22")
	os.system("sudo lxc-attach -n nas1 -- gluster peer probe 10.1.3.23")
 
	# Comprobamos que estan anadidos los peers
	os.system("sudo lxc-attach -n nas1 -- gluster peer status")
 
	os.system("sudo lxc-attach -n nas1 -- gluster volume create nas replica 3 10.1.3.21:/nas 10.1.3.22:/nas 10.1.3.23:/nas force")
 
	# Arrancamos el volumen
	os.system("sudo lxc-attach -n nas1 -- gluster volume start nas")
	time.sleep(10)
 
	# Ver volumenes creados
	os.system("sudo lxc-attach -n nas1 -- gluster volume info")
 
	
 
 
	################################################################
	## SERVIDORES WEB ## 
	################################################################
 
	# Montaje Servidores Web
	#Instalamos CURL en todos los servidores
	os.system("sudo lxc-attach -n s1 -- sudo apt-get install curl")
	os.system("sudo lxc-attach -n s2 -- sudo apt-get install curl")
	os.system("sudo lxc-attach -n s3 -- sudo apt-get install curl")
	os.system("sudo lxc-attach -n s4 -- sudo apt-get install curl")
 
 	#Descargamos NODE.JS en todos los servidores
	os.system("sudo lxc-attach -n s2 -- sudo curl --silent --location https://deb.nodesource.com/setup_4.x | sudo bash -")
	os.system("sudo lxc-attach -n s2 -- sudo curl --silent --location https://deb.nodesource.com/setup_4.x | sudo bash -")
	os.system("sudo lxc-attach -n s3 -- sudo curl --silent --location https://deb.nodesource.com/setup_4.x | sudo bash -")
	os.system("sudo lxc-attach -n s4 -- sudo curl --silent --location https://deb.nodesource.com/setup_4.x | sudo bash -")

	os.system("sudo lxc-attach -n s1 -- sudo apt-get install -y nodejs")
	os.system("sudo lxc-attach -n s2 -- sudo apt-get install -y nodejs")
	os.system("sudo lxc-attach -n s3 -- sudo apt-get install -y nodejs")
	os.system("sudo lxc-attach -n s4 -- sudo apt-get install -y nodejs")
 
	#Copiamos el codigo desde la carpeta de CDPSfy
	os.system("sudo cp -r ../CDPSfy/Server/* /var/lib/lxc/s1/rootfs")
	os.system("sudo cp -r ../CDPSfy/Tracks/* /var/lib/lxc/s2/rootfs")
	os.system("sudo cp -r ../CDPSfy/Tracks/* /var/lib/lxc/s3/rootfs")
	os.system("sudo cp -r ../CDPSfy/Tracks/* /var/lib/lxc/s4/rootfs")

	#Bajamos el fichero hosts de github para S1 para resolver el problema de las direcciones IP
	os.system("sudo lxc-attach -n s1 -- rm -rf /etc/hosts")
	os.system("sudo cp ../CDPSfy/Hosts/hosts /var/lib/lxc/s1/rootfs/etc")
	os.system("sudo lxc-attach -n s1 -- wget https://raw.githubusercontent.com/jorgecb14/CDPSfyServer/master/hosts -P /etc")
    

 	#Configuramos los servidores s2, s3, s4 para que esten conectados a los discos nas
	os.system("sudo lxc-attach -n s2 -- mkdir /mnt/nas")
	os.system("sudo lxc-attach -n s3 -- mkdir /mnt/nas")
	os.system("sudo lxc-attach -n s4 -- mkdir /mnt/nas")
 
	os.system("sudo lxc-attach -n s2 -- mount -t glusterfs 10.1.3.21:/nas /mnt/nas")
	os.system("sudo lxc-attach -n s3 -- mount -t glusterfs 10.1.3.21:/nas /mnt/nas")
	os.system("sudo lxc-attach -n s4 -- mount -t glusterfs 10.1.3.21:/nas /mnt/nas")
 
	
	os.system("sudo lxc-attach -n s1 -- npm install")
	os.system("sudo lxc-attach -n s2 -- npm install")
	os.system("sudo lxc-attach -n s3 -- npm install")
	os.system("sudo lxc-attach -n s4 -- npm install")
 
	print('Servidores montados con exito')
 
################################################################
## INICIAMOS SERVIDORES ## 
################################################################
 
	os.system("sudo lxc-attach -n s1 -- npm start &")
	os.system("sudo lxc-attach -n s2 -- npm start &")
	os.system("sudo lxc-attach -n s3 -- npm start &")
	os.system("sudo lxc-attach -n s4 -- npm start &")

################################################################
## NAGIOS ## 
################################################################

	# Instalamos lo necesario para Nagios
	os.system("sudo lxc-attach -n nagios -- apt-get update")
	os.system("sudo lxc-attach -n nagios -- apt-get install nano")
	os.system("sudo lxc-attach -n nagios -- apt-get install apache2 -y")
	os.system("sudo lxc-attach -n nagios -- apt-get install nagios3 -y")
	os.system("sudo lxc-attach -n nagios -- service apache2 restart")


	#Copiamos los config files para los servidores
	os.system("sudo cp -r ../CDPSfy/Nagios/s1_nagios2.cfg /var/lib/lxc/nagios/rootfs/etc/nagios3/conf.d")
	os.system("sudo cp -r ../CDPSfy/Nagios/s2_nagios2.cfg /var/lib/lxc/nagios/rootfs/etc/nagios3/conf.d")
	os.system("sudo cp -r ../CDPSfy/Nagios/s3_nagios2.cfg /var/lib/lxc/nagios/rootfs/etc/nagios3/conf.d")
	os.system("sudo cp -r ../CDPSfy/Nagios/s4_nagios2.cfg /var/lib/lxc/nagios/rootfs/etc/nagios3/conf.d")

	# Cambiamos el hostgroups
	os.system("sudo lxc-attach -n nagios -- rm -rf /etc/nagios3/conf.d/hostgroups_nagios2.cfg")
	#Copiamos el host group
	os.system("sudo cp -r ../CDPSfy/Nagios/hostgroups_nagios2.cfg /var/lib/lxc/nagios/rootfs/etc/nagios3/conf.d")
	# Reiniciamos nagios3 y apache2
	os.system("sudo lxc-attach -n nagios -- apt-get service apache2 restart")
	os.system("sudo lxc-attach -n nagios -- apt-get service nagios3 restart")

	############################################################
	#CONFIGURAMOS EL BALANCEADOR
	############################################################
	os.system("sudo lxc-attach -n lb -- apt-get install crossroads -y")
	#Le ponemos el & para que se ejecute en segundo plano (Background)
	os.system("sudo lxc-attach -n lb -- xr --verbose --server tcp:0:80 --backend 10.1.2.12:3000 --backend 10.1.2.13:3000 --backend 10.1.2.14:3000 --web-interface 0:8001 -dr &")
	#Reiniciamos los servicios de apache y nagios despues de haber configurado el lb
	os.system("sudo lxc-attach -n nagios -- service apache2 restart")
	os.system("sudo lxc-attach -n nagios -- service nagios3 restart")
	


if __name__ == "__main__":
    main()