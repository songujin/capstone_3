#include <MHZ19PWM.h>         //'MHZ19PWM.h' 포함
#include <SoftwareSerial.h>        //RX, TX 통신 라이브러리 추가

SoftwareSerial Serial1(2,3);         //RX ,TX 핀을 2, 3번 핀으로 지정

long pmcf10=0;
long pmcf25=0;
long pmcf100=0;
long pmat10=0;
long pmat25=0;
long pmat100=0;

MHZ19PWM mhz(3, MHZ_DELAYED_MODE);
char buf[50];
void setup()
{

  Serial.begin(9600);          //115200 시리얼 통신 시작

  Serial.println(F("Starting..."));        //시리얼 모니터에 "Starting..." 표시
  Serial1.begin(9600);        //RX, TX 통신 시작
  delay(2000);       //2초 대기
  mhz.useLimit(5000);

}



void showValue()

{

  unsigned long start = millis();

  float co2 = mhz.getCO2();

  unsigned long duration = millis() - start;



  Serial.print(F("CO2: "));       
  Serial.println(co2);         //시리얼 모니터에 co2 값 표시
  Serial.print(F("Duration: "));
  Serial.println(duration);        //시리얼 모니터에 지속시간 표시


}



void loop()

{

  showValue();        //계산 값 표시

    int count = 0;

  unsigned char c;

  unsigned char high;

  

  while (Serial1.available()) {               

    c = Serial1.read();           //RX, TX 통신을 통한 값을 c로 저장

    if((count==0 && c!=0x42) || (count==1 && c!=0x4d)){

      Serial.println("check failed");

      break;

    }

    if(count > 15){

      Serial.println("complete");

      break;

    }

    else if(count == 4 || count == 6 || count == 8 || count == 10 || count == 12 || count == 14) {

      high = c;

    }

    else if(count == 5){             //pm1.0의 수치값 계산

      pmcf10 = 256*high + c;

      Serial.print("CF=1, PM1.0=");

      Serial.print(pmcf10);

      Serial.println(" ug/m3");

    }

    else if(count == 7){           //pm2.5의 수치값 계산

      pmcf25 = 256*high + c;

      Serial.print("CF=1, PM2.5=");

      Serial.print(pmcf25);

      Serial.println(" ug/m3");

    }

    else if(count == 9){           //pm 10의 수치값 계산

      pmcf100 = 256*high + c;

      Serial.print("CF=1, PM10=");

      Serial.print(pmcf100);

      Serial.println(" ug/m3");

    }

    else if(count == 11){

      pmat10 = 256*high + c;

      Serial.print("atmosphere, PM1.0=");

      Serial.print(pmat10);

      Serial.println(" ug/m3");

    }

    else if(count == 13){

      pmat25 = 256*high + c;

      Serial.print("atmosphere, PM2.5=");

      Serial.print(pmat25);

      Serial.println(" ug/m3");

    }

    else if(count == 15){

      pmat100 = 256*high + c;

      Serial.print("atmosphere, PM10=");

      Serial.print(pmat100);

      Serial.println(" ug/m3");

    }

    count++;

  }

  while(Serial1.available()) Serial1.read();

  Serial.println();

  delay(5000);



}
