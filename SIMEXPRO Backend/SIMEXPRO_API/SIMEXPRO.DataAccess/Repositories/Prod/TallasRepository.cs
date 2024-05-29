using Dapper;
using Microsoft.Data.SqlClient;
using SIMEXPRO.Entities.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SIMEXPRO.DataAccess.Repositories.Prod
{
    public class TallasRepository : IRepository<tbTallas>
    {
        public RequestStatus Delete(tbTallas item)
        {
            using var db = new SqlConnection(SIMEXPRO.ConnectionString);
            RequestStatus result = new();
            var parametros = new DynamicParameters();

            parametros.Add("@tall_Id", item.tall_Id, DbType.Int32, ParameterDirection.Input);
           

            var answer = db.QueryFirst<string>(ScriptsDataBase.EliminarTallas, parametros, commandType: CommandType.StoredProcedure);
            result.MessageStatus = answer;
            return result;
        }

        public tbTallas Find(int? id)
        {
            throw new NotImplementedException();
        }

        public IEnumerable<tbTallas> ListByIdtalla(int tall_Id)
        {
            using var db = new SqlConnection(SIMEXPRO.ConnectionString);
            var parametros = new DynamicParameters();
            parametros.Add("@tall_Id", tall_Id, DbType.Int32, ParameterDirection.Input);
            return db.Query<tbTallas>(ScriptsDataBase.DetalleTallas, parametros, commandType: CommandType.StoredProcedure);
        }


        public RequestStatus Insert(tbTallas item)
        {
            using var db = new SqlConnection(SIMEXPRO.ConnectionString);
            RequestStatus result = new RequestStatus();
            var parametros = new DynamicParameters();
            parametros.Add("@tall_Codigo", item.tall_Codigo, DbType.String, ParameterDirection.Input);
            parametros.Add("@tall_Nombre", item.tall_Nombre, DbType.String, ParameterDirection.Input);
            parametros.Add("@usua_UsuarioCreacion", 1, DbType.Int32, ParameterDirection.Input);
            parametros.Add("@tall_FechaCreacion", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

            var answer = db.QueryFirst<string>(ScriptsDataBase.InsertarTallas, parametros, commandType: CommandType.StoredProcedure);
            result.MessageStatus = answer;
            return result;
        }


        public IEnumerable<tbTallas> List()
        {
            using var db = new SqlConnection(SIMEXPRO.ConnectionString);
            var parametros = new DynamicParameters();
            return db.Query<tbTallas>(ScriptsDataBase.ListarTallas, null, commandType: CommandType.StoredProcedure);
        }


        public RequestStatus Update(tbTallas item)
        {
            using var db = new SqlConnection(SIMEXPRO.ConnectionString);
            RequestStatus result = new RequestStatus();
            var parametros = new DynamicParameters();
            parametros.Add("@tall_Id", item.tall_Id, DbType.String, ParameterDirection.Input);
            parametros.Add("@tall_Codigo", item.tall_Codigo, DbType.String, ParameterDirection.Input);
            parametros.Add("@tall_Nombre", item.tall_Nombre, DbType.String, ParameterDirection.Input);
            parametros.Add("@usua_UsuarioModificacion", 1, DbType.Int32, ParameterDirection.Input);
            parametros.Add("@tall_FechaModificacion", DateTime.Now, DbType.DateTime, ParameterDirection.Input);

            var answer = db.QueryFirst<string>(ScriptsDataBase.EditarTallas, parametros, commandType: CommandType.StoredProcedure);
            result.MessageStatus = answer;
            return result;
        }

    }
}
