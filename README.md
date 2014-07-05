ipmsg-chrome
============

IPMessengerをChrome Packaged Appで実装してみました。テキストメッセージの送受信は既存のIP Messengerと互換性があります。

また、同一LAN内で同じChrome Apps版IP Messengerを使っているクライアントとの間では、WebRTCを使ったビデオチャットができます。このときセッションの確立は、IP Messengerのプロトコルを介して行われ、ICE等のセッション制御サーバは不要、外部ネットワークとの通信も不要です。

# 動作確認方法

1. リポジトリをクローン
2. Chromeのメニューから「ツール -> 拡張機能」を開く
3. Developer ModeのチェックをONに
4. Load unpacked extensionボタンをクリック
5. クローンしたリポジトリの/distディレクトリを指定
6. 拡張機能のリストに「IP Messenger for Chrome」が表示されるので、Launchをクリックして起動

他のマシンでWindows版の[IP Messenger](http://ipmsg.org/)などを使っていただけると、メッセージの送受信を確認できます。

# 制約

* 未完成です。特にビデオチャット周りは不安定です。
* 現状、サブネットマスクが255.255.255.0のネットワークでのみ動作します。
