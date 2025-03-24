# Troubleshooting

## [Fork](https://fork.dev) 사용시 커밋 실패

'env: node: No such file or directory' 메시지와 함께 커밋에 실패한다면, Fork 설정 > Git > ENV PATH를 'System shell'로 변경한다.

pre-commit이 실행되는 환경에서 node 명령어를 실행할 수 없어서 발생하는 문제이다.
