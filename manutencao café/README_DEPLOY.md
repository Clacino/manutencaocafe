# Deploy Guide - Coffee Maintenance System

## 📱 Deploy Mobile (iOS/Android)

### Pré-requisitos

1. **Instalar EAS CLI**
```bash
npm install -g @expo/eas-cli
```

2. **Login no Expo**
```bash
eas login
```

3. **Configurar projeto EAS**
```bash
eas build:configure
```

### Configurações Necessárias

#### 1. **iOS (Apple Developer Account)**
- Apple Developer Account ativo ($99/ano)
- Certificados de desenvolvimento e distribuição
- Provisioning profiles
- App Store Connect configurado

#### 2. **Android (Google Play Console)**
- Google Play Console account ($25 taxa única)
- Keystore para assinatura do app
- Google Play Console configurado

### Comandos de Build

#### **Development Build (para testes)**
```bash
# iOS
eas build --platform ios --profile development

# Android
eas build --platform android --profile development

# Ambos
eas build --platform all --profile development
```

#### **Preview Build (para testes internos)**
```bash
# iOS (TestFlight)
eas build --platform ios --profile preview

# Android (APK)
eas build --platform android --profile preview

# Ambos
eas build --platform all --profile preview
```

#### **Production Build (para stores)**
```bash
# iOS (App Store)
eas build --platform ios --profile production

# Android (Google Play)
eas build --platform android --profile production

# Ambos
eas build --platform all --profile production
```

### Submit para Stores

#### **iOS (App Store)**
```bash
eas submit --platform ios
```

#### **Android (Google Play)**
```bash
eas submit --platform android
```

### Configurações Importantes

#### **1. Atualizar app.json**
- `bundleIdentifier` (iOS): Deve ser único (ex: com.suaempresa.coffemaintenance)
- `package` (Android): Deve ser único (ex: com.suaempresa.coffemaintenance)
- `version`: Versão do app (ex: 1.0.0)
- `buildNumber` (iOS): Número do build (incrementar a cada build)
- `versionCode` (Android): Código da versão (incrementar a cada build)

#### **2. Permissões Configuradas**
✅ **Localização**: Para rastreamento de técnicos
✅ **Câmera**: Para fotos das máquinas
✅ **Galeria**: Para seleção de imagens
✅ **Armazenamento**: Para dados locais

#### **3. Ícones e Assets**
- Ícone principal: `./assets/images/icon.png` (1024x1024)
- Favicon: `./assets/images/favicon.png` (para web)
- Splash screen: Configurado automaticamente

### Fluxo Recomendado

1. **Desenvolvimento**
   ```bash
   eas build --platform all --profile development
   ```

2. **Testes Internos**
   ```bash
   eas build --platform all --profile preview
   ```

3. **Produção**
   ```bash
   eas build --platform all --profile production
   eas submit --platform all
   ```

### Monitoramento

#### **Build Status**
```bash
eas build:list
```

#### **Submission Status**
```bash
eas submission:list
```

### Troubleshooting

#### **Problemas Comuns**

1. **Certificados iOS**
   - Verificar se certificados estão válidos
   - Renovar se necessário

2. **Keystore Android**
   - Manter keystore seguro (backup!)
   - Usar mesmo keystore para updates

3. **Permissões**
   - Verificar se todas as permissões estão declaradas
   - Testar em dispositivos reais

### Custos

#### **iOS**
- Apple Developer Program: $99/ano
- EAS Build: Incluído no plano gratuito (limitado)

#### **Android**
- Google Play Console: $25 (taxa única)
- EAS Build: Incluído no plano gratuito (limitado)

### Próximos Passos

1. Configurar contas de desenvolvedor (Apple/Google)
2. Executar primeiro build de desenvolvimento
3. Testar em dispositivos reais
4. Configurar CI/CD para builds automáticos
5. Implementar analytics e crash reporting
6. Configurar updates OTA com Expo Updates

### Links Úteis

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)