import HomePage from './home/page'
import { generateMetadata } from './[slug]/page'

// El home reexporta HomePage, pero el config de segmento solo se aplica si se
// declara en el propio archivo de ruta. Sin esto, next build intenta prerenderizar
// "/" y revienta porque no hay MongoDB en la etapa de build.
export const dynamic = 'force-dynamic'

export default HomePage

export { generateMetadata }
