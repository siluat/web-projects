import { execSync } from 'child_process'

/**
 * Markdown 또는 MDX 파일의 frontmatter에 git 기준의 lastModified 속성을 추가
 * @reference https://docs.astro.build/en/recipes/modified-time/
 */
export function remarkModifiedTime() {
  return function (_tree, file) {
    const filepath = file.history[0]
    const result = execSync(`git log -1 --pretty="format:%cI" "${filepath}"`)
    file.data.astro.frontmatter.lastModified = result.toString()
  }
}
