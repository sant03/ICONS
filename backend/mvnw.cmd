@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM Begin all REM://DIFFOSCOPE
@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2
@REM
@REM Optional ENV vars
@REM   MVNW_REPOURL - repo url base for downloading maven distribution
@REM   MVNW_USERNAME/MVNW_PASSWORD - user and password for downloading maven
@REM   MVNW_VERBOSE - true: enable verbose logging; debug: trace logging
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0__%"=="" (SET __MVNW_ARG0__=%~dpnx0) ELSE (SET __MVNW_ARG0__=%__MVNW_ARG0__% %~dpnx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_PSMODULEP_SAVE=%PSModulePath%
@SET PSModulePath=
@FOR /F "usebackq tokens=1* delims==" %%A IN (`powershell -noprofile "& {$scriptDir='%~dp0teleport'; $defaultWrapperUrl='https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar'; $distributionUrl=(Get-Content -Raw '%~dp0.mvn\wrapper\maven-wrapper.properties' | Select-String 'distributionUrl=(.*)').Matches.Groups[1].Value.Trim(); $wrapperUrl=(Get-Content -Raw '%~dp0.mvn\wrapper\maven-wrapper.properties' | Select-String 'wrapperUrl=(.*)').Matches; if($wrapperUrl.Count -gt 0){$wrapperUrl=$wrapperUrl.Groups[1].Value.Trim()}else{$wrapperUrl=$defaultWrapperUrl}; $distributionUrlName='apache-maven'; $distributionUrlNameMain=$distributionUrl.Substring($distributionUrl.LastIndexOf('/')+1); $distributionUrlNameBase=$distributionUrlNameMain.Substring(0,$distributionUrlNameMain.LastIndexOf('-bin.')); $mavenHome=Join-Path $Env:USERPROFILE '.m2\wrapper\dists' $distributionUrlNameBase; if(Test-Path (Join-Path $mavenHome 'bin\mvn.cmd')){Write-Output ('__MVNW_CMD__='+$mavenHome)} else { $null=mkdir -Force $mavenHome; $wrapperJar=Join-Path $mavenHome 'maven-wrapper.jar'; if(-not(Test-Path $wrapperJar)){Write-Host 'Downloading Maven wrapper...'; try{ [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile($wrapperUrl,$wrapperJar)} catch{ Write-Output ('__MVNW_ERROR__='+$_); return}}; Write-Host 'Downloading Maven distribution...'; $distZip=Join-Path $mavenHome ($distributionUrlNameMain); try{ [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile($distributionUrl,$distZip)} catch{ Write-Output ('__MVNW_ERROR__='+$_); return}; Expand-Archive $distZip $mavenHome -Force; Remove-Item $distZip; $innerDir=Get-ChildItem $mavenHome -Directory | Where-Object {$_.Name -like 'apache-maven-*'} | Select-Object -First 1; if($innerDir){ Get-ChildItem $innerDir.FullName | Move-Item -Destination $mavenHome -Force; Remove-Item $innerDir.FullName -Force}; Write-Output ('__MVNW_CMD__='+$mavenHome)}}"`) DO @SET "%%A"

@SET PSModulePath=%__MVNW_PSMODULEP_SAVE%
@SET __MVNW_PSMODULEP_SAVE=
@IF NOT "%__MVNW_ERROR__%"=="" (
  @ECHO %__MVNW_ERROR__%
  @SET __MVNW_ERROR__=
  @EXIT /b 1
)
@IF "%__MVNW_CMD__%"=="" @EXIT /b 1

@SET MVNW_MAVEN_HOME=%__MVNW_CMD__%
@SET __MVNW_CMD__=
"%MVNW_MAVEN_HOME%\bin\mvn.cmd" %*
